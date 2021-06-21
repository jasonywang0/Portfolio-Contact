require('dotenv').config()
const express = require("express");
const router = express.Router();
const cors = require("cors");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");
const helmet = require('helmet')

const limiter = rateLimit({
    message: {status: '9000'}, // it's over 9000!
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 2 // limit each IP to 2 requests per windowMs
});


const app = express();
app.use(cors());
app.use(helmet())
app.set('trust proxy', 1);
app.use(limiter);
app.use(express.json());
app.use("/", router);
app.listen(process.env.PORT || 5000, () => console.log("Server Running"));

const contactEmail = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_PASSWORD,
  },
});

contactEmail.verify((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Ready to Send");
  }
});

// really just here so aws doesn't complain
// router.get("/", (req, res) => {
//     res.json('hello')
// })


router.post("/", (req, res) => {

  const name = req.body.name;
  const email = req.body.email;
  const subject = req.body.subject; 
  const message = req.body.message;
  const yum = req.body.yum; //honey pot

  if (!name || !email || !subject || !message || yum) return res.send('ignored');

  const mail = {
    from: email,
    to: "jasonywang0@gmail.com",
    subject: subject,
    html: `
            <p>Sent from portfolio website</p>
            <p>Name: ${name}</p>
            <p>Email: ${email}</p>
            <p>Message: ${message}</p>`,
  };

  contactEmail.sendMail(mail, (error) => {
    if (error) {
      res.json({ status: "ERROR" });
    } else {
      res.json({ status: "SENT" });
    }
  });
});
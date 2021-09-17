const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
 //1. create a transporter
 const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
   user: process.env.SMTP_USERNAME,
   pass: process.env.SMTP_PASSWORD,
  },
 });

 //  2.Define the email options
 const mailOptions = {
  from: 'Admin<ankitblog.tk>',
  to: options.email,
  subject: options.subject,
  text: options.message,
 };

 //send the email
 await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

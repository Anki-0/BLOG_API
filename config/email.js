const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
 //1. create a transporter
 const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_HOST,
  auth: {
   user: process.env.EMAIL_USERNAME,
   pass: process.env.EMAIL_PASSWORD,
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

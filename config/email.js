const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
 //1. create a transporter
 const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
   user: 'nullbyte08@gmail.com',
   pass: 'singhankit25apr@9599344675',
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

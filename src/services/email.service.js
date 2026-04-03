const nodemailer = require("nodemailer");
const config = require("../config/config");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, 
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS,
  },
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000,
  dnsLookup: (hostname, options, callback) => {
    require('dns').lookup(hostname, { family: 4 }, callback); // Forces IPv4
  },
  tls: {
    rejectUnauthorized: false 
  }});
transporter.verify((error,success)=>{ 
    if(error){
        console.log("Error setting up email transporter",error);
    }  else{
        console.log("Email transporter is ready to send messages");
    }})

const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Your Name" <${config.GOOGLE_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = {sendEmail};

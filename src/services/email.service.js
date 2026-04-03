const nodemailer = require("nodemailer");
const config = require("../config/config");

const transporter = const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Must be false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  dnsLookup: (hostname, options, callback) => {
    // This forces the server to ignore IPv6 and use IPv4
    require('dns').lookup(hostname, { family: 4 }, callback);
  },
  tls: {
    // Helps bypass cloud network security restrictions
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2'
  },
  connectionTimeout: 20000, 
});
  
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

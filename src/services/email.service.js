const nodemailer = require("nodemailer");
const config = require("../config/config");
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2'
  },
  connectionTimeout: 20000,
  socketOptions: { family: 4 }, // ✅ force IPv4 at socket level
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
      from: `"Your Name" <${config.EMAIL_USER}>`, // sender address
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

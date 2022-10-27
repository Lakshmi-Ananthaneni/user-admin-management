const { name } = require("ejs");
const nodemailer = require("nodemailer");
const { dev } = require("../config");

exports.sendResetEmail = async(name, email, _id, token) => {
  try {
// create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
       host: "smtp.gmail.com",
       port: 587,
       secure: false, // true for 465, false for other ports
       auth: {
        user: dev.app.authEmail, // generated ethereal user
        pass: dev.app.authPassword, // generated ethereal password
       },
    });
    
    const mailOptions = {
        from: dev.app.authEmail, // sender address
        to: email, // list of receivers
        subject: "Reset Password", // Subject line
        //text: "Hello world?", // plain text body
        html: `<p> Wecome ${name} !!! <a href ="http://localhost:3001/reset-password?token=${token}">
        Please reset your password</a></p>`, // html body
    }

  // send mail with defined transport object
  await transporter.sendMail(mailOptions, (error, info) => {
    if(error) {
        console.log(error);
    }else {
        console.log("Message sent: %s", info.response);
    }
  });

// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
}
catch(error) {
console.log (error);
}
}



  
  
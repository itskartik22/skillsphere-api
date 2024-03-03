const nodemailer = require("nodemailer");

const sendEmail = async (option) => {
  //create transpoter
  const transpoter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //create mail options
  const mailOptions = {
    from: "Kartik Thakur <kartikarya@gmail.com>",
    to: option.email,
    subject: option.subject,
    text: option.message,
  };

  //send mail
  await transpoter.sendMail(mailOptions);
};

module.exports = sendEmail;

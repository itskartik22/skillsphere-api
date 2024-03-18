const nodemailer = require("nodemailer");
const fs = require('fs');
const path = require('path');

const loadTemplate = (url) => {
  // const templatePath = path.resolve(__dirname, "../utils/emailTemplate.html");
  let template = fs.readFileSync(`${__dirname}/../utils/emailTemplate.html`, {encoding: 'utf-8'});
  template = template.replace("YOUR_PASSWORD_RESET_LINK", url);
  return template;
};

const sendEmail = async (option) => {
  // create transpoter
  const transpoter = nodemailer.createTransport({
    service: "SendGrid",
    auth: {
      user: process.env.SENDGRID_USERNAME,
      pass: process.env.SENDGRID_PASSWORD,
    },
  });

  //create mail options
  const mailOptions = {
    from: "Kartik Thakur <kartik.21106107027@mitmuzaffarpur.org>",
    to: option.email,
    subject: option.subject,
    html: loadTemplate(option.url)
    // text: option.message
  };

  //send mail
  await transpoter.sendMail(mailOptions);
};

module.exports = sendEmail;

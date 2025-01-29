var nodemailer = require('nodemailer');
require('dotenv').config();

// Create the transporter with the required configuration for Outlook
// change the user and pass !
const sendMail = async ({ toEmail, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.mailer91.com',
      port: 587, // Use the appropriate port for your configuration
      secure: false, // Set to true for SSL/TLS, false for non-secure
      auth: {
        user: 'emailer@mail.onepoket.com', // Your GoDaddy email address
        pass: 'vUBhmd6DAoR532In', // Your GoDaddy email password
      },
      tls: { rejectUnauthorized: false },
    });

    var mailOptions = {
      from: `"Onepoket" no-reply@mail.onepoket.com `, // sender address (who sends)
      to: toEmail, // list of receivers (who receives)
      subject: subject, // Subject line

      html: html, // html body
    };

    // send mail with defined transport object
    const res = await transporter.sendMail(mailOptions);
    if (res.accepted.length > 0) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.log(err + '    errr');
    throw new Error(err);
  }
};

module.exports = sendMail;

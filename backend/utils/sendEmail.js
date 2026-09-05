const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Create a transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST, // For Gmail: 'smtp.gmail.com'
        port: process.env.EMAIL_PORT, // For Gmail with TLS: 587
        secure: false, // false for TLS
        auth: {
            user: process.env.EMAIL_USERNAME, // Your full Gmail address
            pass: process.env.EMAIL_PASSWORD  // Your 16-character App Password
        }
    });

    // 2. Define the email options
    const mailOptions = {
        from: 'SkillSwap Support <your-email@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };


    if (options.message && !options.text) {
        mailOptions.text = options.message;
    }
    // 3. Send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
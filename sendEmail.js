const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config({path: './.env'});

module.exports = sendEmail = (email, token) => {
    var email = email;
    var token = token;

    var mail = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.USER_EMAIL,
            pass: process.env.USER_PASSWORD
        }
    });

    var mailOptions = {
        from: 'gaurav.khatri@polestarllp.com',
        to: email,
        subject: 'Reset Password Link - Tutsmake.com',
        html: `<p>You requested for reset password, kindly use this <a href="http://localhost:3000/reset-password?token=${token}">link</a> to reset your password</p>
        <br>This link will be valid for only 15 minutes`
    };

    mail.sendMail(mailOptions, function (error, info) {
        if (error) {
            // console.log(1)
        } else {
            // console.log(0)
        }
    });
}
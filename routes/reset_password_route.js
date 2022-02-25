var express = require('express');
var router = express.Router();
var randtoken = require('rand-token');
var bcrypt = require('bcrypt');

var connection = require('../database');
var sendEmail = require('../sendEmail');

/* home page */
router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'Forget Password Page'
    });
});

/* reset page */
router.get('/reset-password', function (req, res, next) {
    console.log(req.query.token);
    res.render('reset-password', {
        title: 'Reset Password Page',
        token: req.query.token
    });
});

/* send reset password link in email */
router.post('/reset-password-email', function (req, res, next) {

    var email = req.body.email;

    connection.query('SELECT * FROM users WHERE email ="' + email + '"', function (err, result) {
        if (err) throw err;

        var type = '';
        var msg = '';

        if (result.length == 0) {
            // console.log('2');
            type = 'error';
            msg = 'The Email is not registered with us';

        }

        else {

            var token = randtoken.generate(20);

            var sent = sendEmail(email, token);

            if (sent != '0') {

                var data = {
                    token: token,
                    otp: 1,
                    password_modified_at: new Date()
                }

                connection.query('UPDATE users SET ? WHERE email ="' + email + '"', data, function (err, result) {
                    if (err) throw err

                })

                type = 'success';
                msg = 'The reset password link has been sent to your email address';

            } else {
                type = 'error';
                msg = 'Something goes to wrong. Please try again';
            }

        }

        req.flash(type, msg);
        res.redirect('/');
    });
})

/* update password to database */
router.post('/update-password', function (req, res, next) {

    var token = req.body.token;
    var password = req.body.password;

    connection.query('SELECT * FROM users WHERE token ="' + token + '"', function (err, result) {
        if (err) throw err;

        var type;
        var msg;

        /*
            1)  firstly check whether the update password url is valid or not by checking 
                the result of the query
            2)  secondly check for the link expiry
            3)  Lastly check for the valid flag is true or not.
        */

        if (result.length > 0) {
            const time_difference_minutes = (new Date() - result[0].password_modified_at) / (1000 * 60);

            if (time_difference_minutes < 1 && result[0].otp) {

                var saltRounds = 10;

                bcrypt.genSalt(saltRounds, function (err, salt) {
                    bcrypt.hash(password, salt, function (err, hash) {

                        var data = {
                            password: hash,
                            otp: 0,
                            password_modified_at: new Date()
                        }

                        connection.query('UPDATE users SET ? WHERE email ="' + result[0].email + '"', data, function (err, result) {
                            if (err) throw err
                            // console.log("updated successfully", result);
                        });

                    });
                });

                type = 'success';
                msg = 'Your password has been updated successfully';

            }

            else if (time_difference_minutes >= 1) {

                var data = {
                    otp: 0,
                }

                connection.query('UPDATE users SET ? WHERE email ="' + result[0].email + '"', data, function (err, result) {
                    if (err) throw err
                });

                // console.log("Your password reset link has been expired. Please try again!");
                type = 'error';
                msg = 'Your password reset link has been expired. Please try again!';
            }

            else {
                // console.log("This link has already been used. Please make a new request to reset your password!");
                type = 'error';
                msg = 'This link has been already used. Please make a new request to reset your password!';
            }

        } else {
            // console.log("Invalid link; please try again");
            type = 'error';
            msg = 'Invalid link; please try again';

        }

        req.flash(type, msg);
        res.redirect('/');
    });
})

module.exports = router;
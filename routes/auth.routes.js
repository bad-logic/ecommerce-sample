const authcontroller = require('./../controllers/auth.controller');
const { check, body } = require('express-validator');
const User = require('./../models/user.model');
const express = require('express');
const Router = express.Router();


//  ROUTES

Router.get('/signup', authcontroller.getSignUp);

Router.post('/signup',
    check('email') // checks email every place in req object
    .isEmail() // validation
    .withMessage('Please enter a valid email address') // error msg to show
    .custom((value, { req }) => {
        // if (value === "admin@admin.com" || value === "test@test.com") {
        //     throw new Error('This email address is Forbidden');
        // }
        // return true;
        return User.findOne({ email: value })
            .then(user => {
                if (user) {
                    // this will be stored as error
                    return Promise.reject('email already exists. Pick a different one');
                };
            })
    }),
    body('password', 'please enter password of minimum length 8') //checks password in body of the req object
    .isLength({ min: 8 })
    .trim(), // saintization removing extra white spaces
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('passwords do not match');
        }
        return true;
    })
    .trim(),
    authcontroller.postSignUp); // the middleware adds error in the 
// req object which can be extracted by calling validationResult on req object

Router.get('/login', authcontroller.getLogIn);

Router.post('/login', [
        check('email') // checks email every place in req object
        .isEmail()
        .withMessage('Invalid email or password')
        .custom((value, { req }) => {
            return User.findOne({ email: value })
                .then(user => {
                    if (!user) {
                        // this will be stored as error
                        return Promise.reject('Invalid email or password');
                    };
                })
        }),
        body('password', 'Invalid email or password') //checks password in body of the req object
        .isLength({ min: 8 })
        .trim()
    ],
    authcontroller.postLogIn);

Router.post('/logout', authcontroller.postLogOut);

Router.get('/reset', authcontroller.getResetPage);

Router.post('/reset', [
        body('email') // checks email every place in req object
        .isEmail()
        .withMessage('Invalid email')
        .custom((value, { req }) => {
            return User.findOne({ email: value })
                .then(user => {
                    if (!user) {
                        // this will be stored as error
                        return Promise.reject('no such email exists');
                    };
                })
        })
    ],
    authcontroller.getResetLink);

Router.get('/reset/:token', authcontroller.getPasswordPage);

Router.post('/reset-password', [
        body('password', 'please enter password of minimum length 8') //checks password in body of the req object
        .isLength({ min: 8 })
        .trim(),
        body('confirmPassword').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('passwords do not match');
            }
            return true;
        })
        .trim()
    ],
    authcontroller.postResetPassword);


module.exports = Router;
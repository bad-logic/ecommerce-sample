const User = require('./../models/user.model');
const jwt = require('jsonwebtoken');
const jwtSecret = '#$%^gfds45SG.P94GrSvQQMW3gdslkj%$Kyo08LDjMTGCcm^%&^';
const nodemailer = require('nodemailer');
const sendgridTransporter = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator');

const transporter = nodemailer.createTransport(
  sendgridTransporter({
    auth: {
      api_key: '<your_own_sendgrid_api_key>',
    },
  })
);

//  HELPER METHODS

function generateJWT(id) {
  return new Promise((resolve, reject) => {
    jwt.sign({ _id: id.toHexString() }, jwtSecret, { expiresIn: '15m' }, (err, token) => {
      if (!err) {
        return resolve(token);
      }
      return reject(err);
    });
  });
}

function verifyJWT(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, jwtSecret, (err, done) => {
      if (err) {
        reject(err);
      } else {
        resolve(done);
      }
    });
  });
}

// CONTROLLER METHODS

exports.getLogIn = (req, res, next) => {
  let message = null;
  res.render('auth/login', {
    pageTitle: 'login',
    path: 'login',
    isAuthenticated: false,
    errorMessage: message,
    oldCred: { email: '', password: '' },
  });
};

exports.postLogIn = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  // res.setHeader('Set-Cookie', 'loggedIn=true'); // sets a cookie in the browser with key value as provided
  // after successfull log in
  // browser sends this key value pair for every requests

  const errors = validationResult(req);
  // validation
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      pageTitle: 'login',
      path: 'login',
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
      oldCred: { email: email, password: password },
    });
  }

  User.confirmCredentials(email, password)
    .then((user) => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      req.session.save((err) => {
        res.redirect('/');
      });
    })
    .catch((err) => {
      if (err.status) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      }
      return res.status(422).render('auth/login', {
        pageTitle: 'login',
        path: 'login',
        isAuthenticated: false,
        errorMessage: 'Invalid email or password',
        oldCred: { email: email, password: password },
      });
    });
};

exports.postLogOut = (req, res, next) => {
  req.session.destroy((err) => {
    res.redirect('/');
  });
};

exports.getSignUp = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    pageTitle: 'signup',
    path: 'signup',
    isAuthenticated: false,
    errorMessage: message,
    validationErrors: [],
    oldCred: { email: '', password: '', confirmPassword: '' },
  });
};

exports.postSignUp = (req, res, next) => {
  const errors = validationResult(req);

  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  // validation
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      pageTitle: 'signup',
      path: 'signup',
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
      oldCred: { email: email, password: password, confirmPassword: confirmPassword },
    });
  }

  // Already checked in validation middleware in the routes

  // User.findOne({ email: req.body.email }).then(user => {
  //         if (user) {
  //             req.flash('error', 'email already exists');
  //             return res.redirect('/signup');
  //         }
  const newUser = new User({
    email: email,
    password: password,
  });
  return newUser
    .save()
    .then((result) => {
      res.redirect('/login');
      return transporter.sendMail({
        to: req.body.email,
        from: 'no-reply@nodeEcommerce.com',
        subject: 'Account Registered',
        html: '<h1>Your account has been created</h1>',
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getResetPage = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/passwordReset', {
    pageTitle: 'Reset Password',
    path: 'reset',
    isAuthenticated: false,
    errorMessage: message,
    oldCred: { email: '' },
  });
};

exports.getResetLink = (req, res, next) => {
  let email = req.body.email;

  const errors = validationResult(req);
  // validation
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/passwordReset', {
      pageTitle: 'Reset Password',
      path: 'reset',
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
      oldCred: { email: email },
    });
  }
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash('error', 'no such email exists');
        return res.redirect('/reset');
      }
      return generateJWT(user._id);
    })
    .then((token) => {
      user.resetToken = token;
      return user.save();
    })
    .then((user) => {
      let link = req.headers.referer + '/' + user.resetToken;
      return transporter.sendMail({
        to: user.email,
        from: 'no-reply@nodeEcommerce.com',
        subject: 'Password Reset Link',
        html: `Click <a href=${link}>here</a> to reset your password.This link expires 
                        in 15 minutes. If you have not requested for this action then you can ignore this email`,
      });
    })
    .then((done) => {
      req.flash('error', 'Password Reset link has been sent to your email.');
      res.redirect('/reset');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getPasswordPage = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  const token = req.params.token;
  res.render('auth/reset', {
    pageTitle: 'Reset Password',
    path: 'reset',
    isAuthenticated: false,
    errorMessage: message,
    resetToken: token,
    validationErrors: [],
    oldCred: { password: '', confirmPassword: '' },
  });
};

exports.postResetPassword = (req, res, next) => {
  const token = req.body.token;
  const newPassword = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);

  // validation
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/reset', {
      pageTitle: 'Reset Password',
      path: 'reset',
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
      resetToken: token,
      validationErrors: errors.array(),
      oldCred: { password: newPassword, confirmPassword: confirmPassword },
    });
  }

  verifyJWT(token)
    .then((data) => {
      return User.findOne({ _id: data._id, resetToken: token });
    })
    .then((user) => {
      if (!user) {
        return Promise.reject({ msg: 'token not in database' });
      } else {
        user.password = newPassword;
        user.resetToken = '';
        return user.save();
      }
    })
    .then((user) => {
      res.redirect('/login');
    })
    .catch((err) => {
      req.flash('error', 'Invalid Token or Token has expired');
      res.redirect(`/reset/${token}`);
    });
};

const path = require('path');
const bodyParser = require('body-parser');
const adminRoutes = require('./routes/admin.routes');
const shopRoutes = require('./routes/shop.routes');
const authRoutes = require('./routes/auth.routes');
const morgan = require('morgan');
const User = require('./models/user.model');
const session = require('express-session');
const mongoSessionStore = require('connect-mongodb-session')(session);
const errorController = require('./controllers/error.controller');
const multer = require('multer');

// to send data while redirecting to another page 
const flash = require('connect-flash');

const express = require('express');
const app = express();

const sessionStore = new mongoSessionStore({
    uri: 'mongodb://localhost:27017/nosql-ecommerce',
    collection: 'sessions'
});


// handling the CSRF attack=> cross site request forgery
// generates a hash token for each view 
// and this token in sent in every request
// even if the session stored in cookie is vulnerable to the attackers 
// they won't be able to guess/know the csrf token
const csrf = require('csurf');
const csrfProtection = csrf();

//  THIRD PARTY MIDDLEWARES

// console the request routes
app.use(morgan('dev'));

// setup for storing the file
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/jpg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

// for parsing the req.body object only texts
app.use(bodyParser.urlencoded({ extended: false }));
// for parsing the req.body for multipart file types
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
// for giving access to the public files that are sent to the browsers (eg: css,js)
app.use(express.static(path.join(__dirname, 'public')));
app.use("/images", express.static(path.join(__dirname, 'images')));

// for maintaining the session of logged in users
app.use(
    session({
        secret: 'sdgf@#$%^dlkf9405345^&*lfjlsdf',
        resave: false,
        saveUninitialized: false,
        store: sessionStore
    })
);

//  use after intitializing the session

// CSRF
app.use(csrfProtection);
//  sending data while redirecting to another page
app.use(flash()); // now this flash middleware can be used from anywhere in the program on request object


// SETTING THE EJS TEMPLATING ENGINE
// AUTO SUPPORTED BY EXPRESS
app.set('view engine', 'ejs');
app.set('views', 'views');

// Adding the isAuthenticated and csrfToken for every views rendered
app.use((req, res, next) => {
    // to set the local variables for every views rendered
    // provided by express
    // for every request that is executed following variable will be set for views that are rendered
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});


// fetching the user if session for that user exists (only in case, the user is logged in session is available)
app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id).then((user) => {
        if (!user) {
            return next();
        }
        req.user = user; //user is a mongoose object so can call all mongoose model functions
        next();
    }).catch(err => {
        // occurs in case not able to connect to the database
        next(new Error(err));
    })
});


// ROUTES
const { checkAuthorised } = require('./middleware/Authorise');
app.use('/admin', checkAuthorised, adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);


app.get('/500', errorController.get500);
// handling the undefined endpoints
app.use(errorController.get404);

// handling errors
// FOR SYNCHRONOUS CODES THROWING ERRORS IS DETECTED BY EXPRESS AND THIS BELOW MIDLLEWARE GETS FIRED
// BUT FOR ASYNCHRONOUS CODES WE NEED TO EXPLICITLY CALL next(err) WITH ERROR TO FIRE THIS MIDDLEWARE
app.use((err, req, res, next) => {
    // res.redirect('/500');
    console.log("error>>", err);
    res.status(500).render('500', {
        pageTitle: 'Server Error',
        path: '500',
        isAuthenticated: req.session.isLoggedIn
    });
});

module.exports = { app };
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const express = require('express')
const app = express()
const path = require('path')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize');

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
const Joi = require('joi')
const { campgroundSchema, reviewSchema } = require('./schemas.js')

const userRoutes = require('./routes/user');
const campgroundRoutes = require('./routes/campground')
const reviewRoutes = require('./routes/review')

const ExpressError = require('./utils/ExpressError')

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

var methodOverride = require('method-override')
app.use(methodOverride('_method'))

const mongoose = require('mongoose');
const { findByIdAndUpdate } = require('./models/campground');
mongoose.connect('mongodb://localhost:27017/yelp-camp')
    .then(() => {
        console.log("Connection created")
        app.listen(3000, () => {
            console.log('Connection created!!')
        })
    })
    .catch((err) => {
        console.log("OOPs error found!!");
        console.log(err);
    })


app.use(mongoSanitize());   
const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
        maxAge: (1000 * 60 * 60 * 24 * 7)
    }
}
app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    //console.log(req.query)
    //EVERY TEMPLATE WILL HAVE ACCESS TO res.locals
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/', (req, res) => {
    res.render('home')
})
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found!!', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) {
        err.message = 'Oh Nooo! Something went wrong!!'
    }
    res.status(statusCode).render('error', { err });
})
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
const bodyPareser=require('body-parser');
const MongoDBStore=require("connect-mongo");

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
const userRoutes = require('./routes/user');
const campgroundRoutes = require('./routes/campground')
const reviewRoutes = require('./routes/review')

const ExpressError = require('./utils/ExpressError')

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

var methodOverride = require('method-override')
app.use(methodOverride('_method'))

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_KEY)
    .then(() => {
        console.log("Connection created")
        app.listen(process.env.PORT | 3000, () => {
            console.log('Connection created!!')
        })
    })
    .catch((err) => {
        console.log("OOPs error found!!");
        console.log(err);
    })


const PUBLISHABLE_KEY ='pk_test_51KWOKiSFLJZPP6NyspDoLNfCxCuFNrhCHmFBP0SA4Ug6DLoIMXPOrOglKcGqogism3HWRmu01ljLpXZGCxc1n0i700AksD09zk'
const SECRET_KEY ='sk_test_51KWOKiSFLJZPP6NyGdtce0kekk7pdxwkOj1gPb6Iz9QgJL4uv5nLhbmbQ8DkxQFK63MZKIFwCsxG9fJ7054No3MK00eUFfF1iK'

const stripe=require('stripe')(SECRET_KEY)



app.use(mongoSanitize());   
const sessionConfig = {
    store: MongoDBStore.create({
        mongoUrl: process.env.MONGO_KEY,
    }),
    name:'session',
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure:true,
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
app.get('/payment', function (req, res) {
    res.render('payment', {
        key: PUBLISHABLE_KEY
    })
})
app.post('/payment', function (req, res) {

    // Moreover you can take more details from user 
    // like Address, Name, etc from form 
    stripe.paymentIntents.create({
        email: req.body.stripeEmail,
        source: req.body.stripeToken,
        name: 'Yelpcamp',
        address: {
            line1: 'TC 9/4 Old MES colony',
            postal_code: '110092',
            city: 'New Delhi',
            state: 'Delhi',
            country: 'India',
        }
    })
        .then((customer) => {

            return stripe.charges.create({
                amount: 7000,    // Charing Rs 25 
                description: 'Campground',
                currency: 'USD',
                customer: customer.id
            });
        })
        .then((charge) => {
            res.send("Success") // If no error occurs 
        })
        .catch((err) => {
            res.send(err)    // If some error occurs 
        });
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
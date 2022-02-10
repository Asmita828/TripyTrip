const express = require('express')
const app = express()
const path = require('path')
const ejsMate = require('ejs-mate')
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
const Joi = require('joi')
const { campgroundSchema, reviewSchema } = require('./schemas.js')

const campgrounds = require('./routes/campground')
const reviews = require('./routes/review')
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

app.get('/', (req, res) => {
    res.render('home')
})

app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews);

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
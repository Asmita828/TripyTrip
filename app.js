const express = require('express')
const app = express()
const path = require('path')
const ejsMate = require('ejs-mate')
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')

app.use(express.urlencoded({ extended: true }))

var methodOverride = require('method-override')
app.use(methodOverride('_method'))

const Campground = require('./models/campground')

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
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campground/index', { campgrounds })
}))

app.post('/campgrounds', catchAsync(async (req, res) => {
    if (!req.body.campground) throw new ExpressError("Invalid Campground Data", 400)
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`campgrounds/${campground._id}`)
}))
app.get('/campgrounds/new', (req, res) => {
    res.render('campground/new')
})

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    //console.log(req.params)
    const campground = await Campground.findById(req.params.id);
    res.render('campground/show', { campground })
}))

app.put('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    //console.log(req.params)
    const campground = await Campground.findById(req.params.id);
    res.render('campground/edit', { campground })
}))

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found!!', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) {
        err.message = 'Oh Nooo! Something went wrong!!'
    }
    //console.log(err)
    res.status(statusCode).render('error', { err });
})
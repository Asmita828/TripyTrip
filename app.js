const express = require('express')
const app = express()
const path = require('path')
const ejsMate = require('ejs-mate')
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))

var methodOverride = require('method-override')
app.use(methodOverride('_method'))

const Campground = require('./models/campground')

const mongoose = require('mongoose');
const { findByIdAndUpdate } = require('./models/campground')
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
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campground/index', { campgrounds })
})

app.post('/campgrounds', async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`campgrounds/${campground._id}`)
})
app.get('/campgrounds/new', (req, res) => {
    res.render('campground/new')
})

app.get('/campgrounds/:id', async (req, res) => {
    //console.log(req.params)
    const campground = await Campground.findById(req.params.id);
    res.render('campground/show', { campground })
})

app.put('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    res.redirect(`/campgrounds/${campground._id}`)
})

app.get('/campgrounds/:id/edit', async (req, res) => {
    //console.log(req.params)
    const campground = await Campground.findById(req.params.id);
    res.render('campground/edit', { campground })
})

app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
})

const express = require('express')
const app = express()
const path = require('path')
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

const Campground = require('./models/campground')

const mongoose = require('mongoose');
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
app.get('/campground', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campground/index', { campgrounds })
})


const Campground = require('../models/campground')
const mongoose = require('mongoose');
const cities = require('./cities')
const { descriptors, places } = require('./seedhelpers')
mongoose.connect('mongodb://localhost:27017/yelp-camp')
    .then(() => {
        console.log("Connection created")

    })
    .catch((err) => {
        console.log("OOPs error found!!");
        console.log(err);
    })

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 5; i++) {
        const random = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            location: `${cities[random].city},${cities[random].state}`,
            title: `${sample(places)} ${sample(descriptors)}`
        })
        await camp.save();
    }
}
seedDB().then(() => {
    mongoose.connection.close()
});
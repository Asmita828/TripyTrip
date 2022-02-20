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
    for (let i = 0; i < 50; i++) {
        const random = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '6207ff64b4ec6c0d472587fd',
            location: `${cities[random].city},${cities[random].state}`,
            title: `${sample(places)} ${sample(descriptors)}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/university-institute-of-engineering-and-technology-punjab-university/image/upload/v1645110609/YelpCamp/e3hnxbi1pzug8dj73ulb.png',
                    filename: 'YelpCamp/e3hnxbi1pzug8dj73ulb',
                }
            ],
            geometry: {
                type: "Point",
                coordinates: [-113.1331, 47.0202]
            },
            description: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Eligendi praesentium aspernatur ratione voluptatem natus nisi consequatur ullam! Dolores, voluptate. Similique, accusamus ipsa consectetur tenetur non dolores tempora necessitatibus molestiae sunt!',
            price: price
        })
        await camp.save();
    }
}
seedDB().then(() => {
    mongoose.connection.close()
});
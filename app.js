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

    })
    .catch((err) => {
        console.log("OOPs error found!!");
        console.log(err);
    })
// mongoose.connect('mongodb://localhost:27017/yelp-camp', {
//     // useNewUrlParser: true,
//     //userCreateIndex: true,
//     // useUnifiedTopology: true
// });
// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error:"));
// db.once("open", () => {
//     console.log("Database Connected!!");
// });

app.get('/', (req, res) => {
    res.render('home')
})
app.get('/campground', async (req, res) => {
    const camp = new Campground({ title: 'My Backyard' });
    await camp.save();
    res.send(camp);
})
app.listen(3000, () => {
    console.log('Connection created!!')
})

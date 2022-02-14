const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const Campground = require('../models/campground')
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campground/index', { campgrounds })
}))

router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    // if (!req.body.campground) throw new ExpressError("Invalid Campground Data", 400)
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', "Successfully made a new Campground!");
    res.redirect(`campgrounds/${campground._id}`)
}))
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campground/new')
})

router.get('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews').populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campground/show', { campground })
}))

router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    req.flash('success', 'Successfully updated campground')
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    //console.log(req.params)
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campground/edit', { campground })
}))

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted Campground');
    res.redirect('/campgrounds')
}))

module.exports = router;
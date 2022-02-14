const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateReview } = require('../middleware');
const Campground = require('../models/campground');
const Review = require('../models/review');

const { reviewSchema } = require('../schemas.js')

const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')

router.post('/', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { $pull: { review: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!');
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;
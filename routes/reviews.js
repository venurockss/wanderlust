const express = require("express");
const router = express.Router({mergeParams : true});

const { reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/Express.js");
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const review = require("../models/reviews.js");
const {isLogged, isReviewAuthor} = require("../middleware.js")




const validateReview = (req,res,next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    else{
        next();
    }
}

router.post("/",isLogged,validateReview ,wrapAsync(async (req,res) => {
    let listing = await Listing.findById(req.params.id);
    if (!listing) {
       
        return res.status(404).send("Listing not found");
      }
    let newReview = new review({
        comment: req.body.review.comment, 
        rating: req.body.review.rating  });
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
   
    res.redirect(`/listing/${listing._id}`);


   
} ));

// delete review route
router.delete("/:reviewId",isLogged ,wrapAsync(async(req,res) => {
    let {id,reviewId} = req.params;
    await Listing.findByIdAndUpdate(id,{$pull : {reviews : reviewId}})
    await review.findByIdAndDelete(reviewId);
    res.redirect(`/listing/${id}`);
}))

module.exports = router;

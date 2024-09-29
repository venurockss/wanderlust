const Listing = require("./models/listing");
const Review = require("./models/reviews");

module.exports.isLogged = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You need to log in.");
        return res.redirect("/login");  // Added return to prevent further execution
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    let { id,owner} = req.params;  // Remove `owner` from params if not needed
    let listing = await Listing.findById(id);
    
   
   

    // Check if the user is logged in and is the owner of the listing
    if (!res.locals.currentUser || owner&&!listing.owner.equals(res.locals.currentUser._id)) {
        req.flash("error", "You are not the owner of this listing");
        return res.redirect(`/listing/${id}`);
    }

    next();
}


module.exports.isreviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    
    // Check if the review was found
    if (!review) {
        req.flash("error", "Review not found");
        return res.redirect(`/listing/${id}`);  // Redirect if review not found
    }
    
    // Check if the user is logged in and is the author of the review
    if (!res.locals.currentUser || !review.author.equals(res.locals.currentUser._id)) {
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listing/${id}`);
    }
    
    next();
}


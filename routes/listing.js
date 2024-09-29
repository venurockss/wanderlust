const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/Express.js");
const Listing = require("../models/listing.js");
const { isLogged, isOwner, isreviewAuthor } = require("../middleware.js");
const listing = require("../models/listing.js");
const {storage} = require("../cloudConfig.js");
const multer = require('multer');
const upload = multer({storage});
const {validateListing}  = require("../controllers/listing.js");

// const validateListing = (req, res, next) => {
//     let { error } = listingSchema.validate(req.body);
//     if (error) {
//         let errMsg = error.details.map((el) => el.message).join(",");
//         throw new ExpressError(400, errMsg);
//     } else {
//         next();
//     }
// };

// Index route (list all listings)
router.get("/", wrapAsync(async (req, res) => {
    try {
       
        const allListings = await Listing.find({});
        return res.render("../view/listings/index.ejs", { allListings});  // Return after rendering
    } catch (err) {
        console.error("Error fetching listings:", err);
        return res.status(500).send("Error fetching listings");  // Return after sending response
    }
}));

// Create new listing (form route)
router.get("/new", isLogged, isOwner,(req, res) => {
    return res.render("../view/listings/newForm.ejs");  
});


// Show individual listing details
router.get("/:id", wrapAsync(async (req, res, next) => {
    try {
        let { id } = req.params;
        const listinginfo = await Listing.findById(id).populate({path :"reviews",populate :{path :"author"}}).populate("owner");
        if (!listinginfo) {
            return next(new ExpressError(404, "Listing not found"));  // Return to avoid further code execution
        }
        // console.log(listinginfo);
        return res.render("../view/listings/show.ejs", { listinginfo }); 
        // Return after rendering
    } catch (err) {
        return next(err);  // Return to pass the error correctly
    }
}));

// Add new listing (create route)
router.post("/", isLogged,upload.single('listing[image]'),validateListing, wrapAsync(async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url,filename};
    await newListing.save();
    req.flash("success", "New listing is created");
    return res.redirect("/listing");  // Return after redirect
}));


// Edit listing (form route)
router.get("/:id/edit", isLogged,isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listinginfo = await Listing.findById(id);
    return res.render("../view/listings/edit.ejs", { listinginfo });  // Return after rendering
}));

// Update listing
router.put("/:id", isOwner, upload.single('listing[image]'), validateListing, wrapAsync(async (req, res) => {
    const { id } = req.params;

    // Update the listing with the new details from req.body
    const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true }); // Use { new: true } to return the updated document

    // If there's a file uploaded, update the image field
    if (typeof req.file !== "undefined") {
        const url = req.file.path;
        const filename = req.file.filename;
        
        // Update the image field in the fetched listing object
        listing.image = { url, filename };
        await listing.save();  // Now this will work because listing is a valid Mongoose object
    }

    req.flash("success", "Listing updated");
    return res.redirect(`/listing/${id}`);
}));


// Delete listing
router.delete("/:id", isLogged,isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    return res.redirect("/listing");  // Return after redirect
}));

module.exports = router;

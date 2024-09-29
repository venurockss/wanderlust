const express = require("express");
const router = express.Router();
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");

router.get("/signup", (req, res) => {
    res.render('users/signup.ejs')
})
router.post("/signup", wrapAsync(async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({
            email, username
        });
        const registeruser = await User.register(newUser, password);
        // console.log(registeruser);

        req.login(registeruser, (err) => {
            if (err) {
                return next(err); // Handle error by calling next
            }
            req.flash("success", "created account successfully");
            res.redirect("/listing");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));



router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

router.post("/login", 
    saveRedirectUrl,
    passport.authenticate("local", {
    failureRedirect: "/login", 
    failureFlash: true 
}), (req, res) => {
    req.flash("success", "Welcome back!");
    
   
    let redirect = res.locals.redirectUrl || "/listing" ;
    res.redirect(redirect);
});

router.get("/logout",(req,res,next) => {
    req.logout((err)=>{
        if(err){
            next(err);
        }
        req.flash("success","succesfully logged out ");
        res.redirect("/listing");
    })
})

module.exports = router;
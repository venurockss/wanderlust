if(process.env.NODE_ENV != "production"){
require('dotenv').config()
}


const express = require("express");
const ejs = require("ejs");
const app = express();
const mongoose = require("mongoose");
const Listing = require("../Airbnb/models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const Joi = require('joi');
const session = require("express-session");
const MongoStore = require('connect-mongo');
const cors = require('cors');
const flash = require("connect-flash");

const ExpressError = require("./utils/Express.js");
const review = require("../Airbnb/models/reviews.js");
const passport =require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user.js");


const listing = require("./routes/listing.js");
const reviews = require("./routes/reviews.js");
const userRoute = require("./routes/userRoute.js");
const { log } = require('console');


app.set('views', path.join(__dirname, 'view')); 
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
app.use(cors());
main().then(() => {
    console.log("the server is running");
}).catch(err => console.log(err));
// const DbUrl = process.env.ATLASDB;

async function main() {
     await mongoose.connect(process.env.ATLASDB);
}

const store = MongoStore.create({
    mongoUrl:process.env.ATLASDB,
    crypto : {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600

});
store.on("error",() => {
    console.log("there is some error in the store",err);
})

const sessionOpt = {
    store,
    secret:  process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie : {
        expires : Date.now() + 7*24*60*60*1000,
        maxAge :  7*24*60*60*1000,
        httpOnly : true
    }
}


app.use(session(sessionOpt));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    
    res.locals.currentUser = req.user;
    
    next();
});

app.use(passport.initialize());
app.use(passport.session());







app.use("/listing",listing);
app.use("/listing/:id/review",reviews);
app.use("/",userRoute);



// app.all("*",(req,res,next) => {
//     next(new ExpressError(404,"Page not found."))
// })
// app.use((err, req, res, next) => {
//     let {statusCode=500,message="something went wrong" } =err;
//     res.render("error.ejs",{ err });

    
// })
app.listen(3000, () => {
    console.log("the app is listing on the port ")
});
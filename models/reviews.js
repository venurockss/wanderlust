const mongoose  = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const reviewSchema = new Schema({
    comment : String,
    rating : {
        type:Number,
        min:1,
        max:5
    },
    createdAt : {
        type : Date,
        default : Date.now()
    },
    author : {
        type : Schema.Types.ObjectId,
        ref : "User"
    }
})
reviewSchema.plugin(passportLocalMongoose);


module.exports = mongoose.model("Review",reviewSchema);
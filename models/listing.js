const { ref } = require('joi');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const listingSchema = new Schema({
    title: {
        type: String,
        // required: true

    },
    description: {
        type: String
    },
    image: {
         filename : { type : String},
        url: { type: String }
    },
    price: Number,
    location: String,
    country: String,
    reviews : [
        {
            type : Schema.Types.ObjectId,
            ref:"Review"
        }
    ],
    owner : {
           type : Schema.Types.ObjectId,
            ref:"User"
    }
});

module.exports = mongoose.model('Listing', listingSchema);

const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
    product_name: { type: String, required: true },
    product_description: { type: String },
    product_price: { type: Number, required: true },
    product_details: { type: Array },
    product_image: { type: Object },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
});

const Offer = mongoose.model("Offer", offerSchema);

module.exports = Offer;
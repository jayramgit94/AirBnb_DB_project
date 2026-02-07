const mongoose = require("mongoose");
const airbnbConnection = require("../db/airbnb.connection");

const airbnbListingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
    price: { type: Number, required: true, min: 1 },
    location: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

module.exports = airbnbConnection.model("AirbnbListing", airbnbListingSchema);

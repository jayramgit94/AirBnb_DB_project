const mongoose = require("mongoose"); // ✅ import mongoose
const schema = mongoose.Schema; // ✅ use mongoose.Schema to create a schema
// ✅ define the schema for a listing

const listingSchema = new schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      set: (v) =>
        v === ""
          ? "https://images.unsplash.com/photo-1506744038136-46273834b3fb" // ✅ direct image URL
          : v,
      default: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    },
    price: {
      type: Number,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  { timestamps: true },
);

//now will create a model from the schema
const listing = mongoose.model("listing", listingSchema);
module.exports = listing;

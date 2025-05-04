const mongoose = require("mongoose");
const schema = mongoose.Schema;

const listingSchema = new schema({
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
});

const listing = mongoose.model("listing", listingSchema);
module.exports = listing;

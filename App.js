const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const Listing = require("./models/listing.js");

const app = express();
const MONGO_URL = "mongodb://127.0.0.1:27017/airbnb";

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Connect to MongoDB
async function main() {
  console.log("Attempting to connect to MongoDB...");
  await mongoose.connect(MONGO_URL);
  console.log("Connected to MongoDB!");
}
main()
  .then(() => console.log("MongoDB connection successful."))
  .catch((err) => console.error("MongoDB connection failed:", err.message));

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes

// Read All Listings
app.get("/listings", async (req, res) => {
  const alllisting = await Listing.find({});
  res.render("listings/index.ejs", { listings: alllisting });
});

// Show Create Form
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// Create Listing
app.post("/listings", async (req, res) => {
  const { title, description, image, price, location, country } = req.body;
  const newListing = new Listing({
    title,
    description,
    image,
    price,
    location,
    country,
  });
  await newListing.save();
  console.log("New listing created:", newListing);
  res.redirect("/listings");
});

// Read One Listing
app.get("/listings/:id", async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", { listing });
});

// Show Edit Form
app.get("/listings/:id/edit", async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
});

// Update Listing (via method override)
app.put("/listings/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, image, price, location, country } = req.body;
  await Listing.findByIdAndUpdate(id, {
    title,
    description,
    image,
    price,
    location,
    country,
  });
  res.redirect(`/listings/${id}`);
});

// Delete Listing
app.delete("/listings/:id", async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});

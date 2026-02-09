const mongoose = require("mongoose");
const sampleData = require("./data.js");
const Listing = require("../models/listing.js");

require("dotenv").config();

const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
  throw new Error("Missing MONGO_URL in environment.");
}

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to MongoDB!");
}

const initDB = async () => {
  try {
    await Listing.deleteMany({}); // clear existing data before seeding
    await Listing.insertMany(sampleData.data); // 👈 access `.data`
    console.log("Database seeded successfully.");
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    mongoose.connection.close();
  }
};

main().then(initDB);

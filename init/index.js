const mongoose = require("mongoose");
const sampleData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/airbnb";

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to MongoDB!");
}

const initDB = async () => {
  try {
    await Listing.deleteMany({});
    await Listing.insertMany(sampleData.data); // 👈 access `.data`
    console.log("Database seeded successfully.");
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    mongoose.connection.close();
  }
};

main().then(initDB);

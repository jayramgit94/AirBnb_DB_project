const mongoose = require("mongoose");

if (!process.env.MONGO_AIRBNB_URI) {
  throw new Error("Missing MONGO_AIRBNB_URI environment variable.");
}

const airbnbConnection = mongoose.createConnection(
  process.env.MONGO_AIRBNB_URI,
  {
    dbName: "airbnb",
  },
);

airbnbConnection.on("connected", () => {
  console.log("Airbnb MongoDB connection established.");
});

airbnbConnection.on("error", (err) => {
  console.error("Airbnb MongoDB connection error:", err.message);
});

module.exports = airbnbConnection;

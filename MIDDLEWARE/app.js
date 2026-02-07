const express = require("express");
const app = express();

app.use(express.json());

// Auth middleware for /api
// app.use("/api", (req, res, next) => {
//   let { token } = req.query;
//   if (token === "12345") {
//     next();
//   } else {
//     res.send("Unauthorized access!");
//   }
// });

//also can create a middleware function
const authMiddleware = (req, res, next) => {
  let { token } = req.query;
  if (token === "12345") {
    next();
  } else {
    // res.send("Unauthorized access!");
    throw new Error("Unauthorized access!"); // Throw an error instead
  }
};

// Allow GET requests to /api
app.get("/api", authMiddleware, (req, res) => {
  res.send("GET request successful! You are authorized.");
});

// POST route
app.post("/api", authMiddleware, (req, res) => {
  res.send("Data created successfully!");
});

// Logger
app.use((req, res, next) => {
  console.log(`${req.method} request for '${req.url}'`);
  next(); // You forgot this in your code!
});

app.get("/", (req, res) => {
  res.send("Welcome to the Home Page!");
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});

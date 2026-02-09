const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const User = require("./models/user.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcrypt");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

require("dotenv").config();

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/airbnb";
const PORT = process.env.PORT || 3000;
const SESSION_SECRET =
  process.env.SESSION_SECRET || "dev_only_change_this_secret";
const IS_PROD = process.env.NODE_ENV === "production";

// Middleware
if (IS_PROD) {
  app.set("trust proxy", 1);
}

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsmate);
app.use(
  express.static(path.join(__dirname, "Public"), {
    maxAge: "7d",
    etag: true,
  }),
);
// Set up the view engine

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(
  session({
    name: "wanderlust.sid",
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGO_URL,
      ttl: 60 * 60 * 24 * 7,
    }),
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: IS_PROD,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use((req, res, next) => {
  res.locals.currentUser = req.session.userId || null;
  res.locals.currentUsername = req.session.username || null;
  next();
});

morgan.token("user", (req) => req.session?.username || "guest");
morgan.token("session", (req) => req.session?.userId || "-");

app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms user=:user session=:session",
  ),
);

// Connect to MongoDB
async function main() {
  console.log("Attempting to connect to MongoDB...");
  await mongoose.connect(MONGO_URL);
  console.log("Connected to MongoDB!");
}
main()
  .then(() => console.log("MongoDB connection successful."))
  .catch((err) => console.error("MongoDB connection failed:", err.message));

// Routes

const normalizeListingPayload = (payload = {}) => {
  const cleaned = {
    title: (payload.title || "").trim(),
    description: (payload.description || "").trim(),
    image: (payload.image || "").trim(),
    price: Number(payload.price),
    location: (payload.location || "").trim(),
    country: (payload.country || "").trim(),
  };

  return cleaned;
};

const validateListing = (listing) => {
  const required = ["title", "description", "price", "location", "country"];
  const missing = required.filter((field) => !listing[field]);
  const invalidPrice = Number.isNaN(listing.price) || listing.price <= 0;

  return {
    isValid: missing.length === 0 && !invalidPrice,
    missing,
    invalidPrice,
  };
};

const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    req.session.returnTo = req.originalUrl;
    const message = encodeURIComponent("Please log in to continue.");
    return res.redirect(`/auth/login?message=${message}`);
  }
  next();
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.get(
  "/",
  wrapAsync(async (req, res) => {
    const featuredListings = await Listing.find({}).sort({ _id: -1 }).limit(6);
    res.render("listings/home.ejs", { listings: featuredListings });
  }),
);
// Show About Page

// Read All Listings
app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const alllisting = await Listing.find({}).sort({ _id: -1 });
    res.render("listings/index.ejs", { listings: alllisting });
  }),
);

// Show Create Form
app.get("/listings/new", requireAuth, (req, res) => {
  res.render("listings/new.ejs");
});

// Create Listing
app.post(
  "/listings",
  requireAuth,
  wrapAsync(async (req, res) => {
    const listingPayload = normalizeListingPayload(req.body);
    const validation = validateListing(listingPayload);

    if (!validation.isValid) {
      return res.status(400).render("error.ejs", {
        title: "Invalid listing",
        message:
          "Please provide all required fields and a valid price above 0.",
      });
    }

    const newListing = new Listing(listingPayload);
    await newListing.save();
    res.redirect("/listings");
  }),
);

// Read One Listing
app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).render("error.ejs", {
        title: "Listing not found",
        message: "We couldn't find that listing. Please try another one.",
      });
    }
    res.render("listings/show.ejs", { listing });
  }),
);

// create route
// app.post("/listings", wrapAsync( async (req, res) => {
//   const newListing = new Listing(req.body);
//   await newListing.save();
//   res.redirect("/listings");
// }));

// Show Edit Form
app.get(
  "/listings/:id/edit",
  requireAuth,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).render("error.ejs", {
        title: "Listing not found",
        message: "We couldn't find that listing to edit.",
      });
    }
    res.render("listings/edit.ejs", { listing });
  }),
);

// Update Listing (via method override)
app.put(
  "/listings/:id",
  requireAuth,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listingPayload = normalizeListingPayload(req.body);
    const validation = validateListing(listingPayload);

    if (!validation.isValid) {
      return res.status(400).render("error.ejs", {
        title: "Invalid listing",
        message:
          "Please provide all required fields and a valid price above 0.",
      });
    }

    const updated = await Listing.findByIdAndUpdate(id, listingPayload, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).render("error.ejs", {
        title: "Listing not found",
        message: "We couldn't find that listing to update.",
      });
    }

    res.redirect(`/listings/${id}`);
  }),
);

// Delete Listing
app.delete(
  "/listings/:id",
  requireAuth,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
  }),
);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/auth/login", (req, res) => {
  res.render("auth/login.ejs", {
    error: null,
    message: req.query.message || null,
  });
});

app.get("/auth/signup", (req, res) => {
  res.render("auth/signup.ejs", { error: null });
});

app.post(
  "/auth/signup",
  authLimiter,
  wrapAsync(async (req, res) => {
    const { username, email, password } = req.body;
    const cleanedEmail = (email || "").trim().toLowerCase();
    const cleanedUsername = (username || "").trim();

    if (!cleanedUsername || !cleanedEmail || !password) {
      return res.status(400).render("auth/signup.ejs", {
        error: "Please fill in all required fields.",
      });
    }

    if (!emailRegex.test(cleanedEmail)) {
      return res.status(400).render("auth/signup.ejs", {
        error: "Please enter a valid email address.",
      });
    }

    const existing = await User.findOne({ email: cleanedEmail });
    if (existing) {
      return res.status(400).render("auth/signup.ejs", {
        error: "An account with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: cleanedUsername,
      email: cleanedEmail,
      passwordHash,
    });

    req.session.userId = user._id;
    req.session.username = user.username;
    res.redirect("/listings");
  }),
);

app.post(
  "/auth/login",
  authLimiter,
  wrapAsync(async (req, res) => {
    const { email, password } = req.body;
    const cleanedEmail = (email || "").trim().toLowerCase();

    if (!cleanedEmail || !password) {
      return res.status(400).render("auth/login.ejs", {
        error: "Please enter your email and password.",
        message: null,
      });
    }

    const user = await User.findOne({ email: cleanedEmail });
    if (!user) {
      return res.status(401).render("auth/login.ejs", {
        error: "Invalid email or password.",
        message: null,
      });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).render("auth/login.ejs", {
        error: "Invalid email or password.",
        message: null,
      });
    }

    req.session.userId = user._id;
    req.session.username = user.username;

    const redirectTo = req.session.returnTo || "/listings";
    delete req.session.returnTo;
    res.redirect(redirectTo);
  }),
);

app.get("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

app.use((req, res) => {
  res.status(404).render("error.ejs", {
    title: "Page not found",
    message: "The page you're looking for doesn't exist.",
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("error.ejs", {
    title: "Something went wrong",
    message: "We hit a snag. Please try again in a moment.",
  });
});

// Start the server only when running locally
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;

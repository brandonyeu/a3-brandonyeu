const bcrypt = require("bcrypt");
const express = require("express")
const bodyParser = require("body-parser")
const session = require("express-session")
const { MongoClient, ObjectId } = require("mongodb")
const path = require("path")

const app = express()
const port = process.env.PORT || 3000
const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017"
const dbName = "a3db"

let db, users, rsvps

// Middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // set to true if using HTTPS
  })
)
app.use(express.static("public"))

// Connect to Mongo
MongoClient.connect(mongoUrl)
  .then((client) => {
    db = client.db(dbName)
    users = db.collection("users")
    rsvps = db.collection("rsvps")
    console.log("✅ Connected to MongoDB")

    app.listen(port, () => console.log(`🚀 Server running on http://localhost:${port}`))
  })
  .catch((err) => console.error("❌ MongoDB Connection Error:", err))

// -------- Authentication --------
// LOGIN
app.post("/login", async (req, res) => {
  const { username, password } = req.body
  const user = await users.findOne({ username })

  if (!user) {
    return res.status(400).json({ error: "User not found" })
  }

  const match = await bcrypt.compare(password, user.password) // compare hash
  if (!match) {
    return res.status(400).json({ error: "Incorrect password" })
  }

  req.session.user = { username }
  res.json({ success: true, username })
})

// SIGNUP
app.post("/signup", async (req, res) => {
  const { username, password } = req.body
  const existing = await users.findOne({ username })

  if (existing) {
    return res.status(400).json({ error: "User already exists" })
  }

  const hashed = await bcrypt.hash(password, 10)  // hash password
  await users.insertOne({ username, password: hashed })

  req.session.user = { username }
  res.json({ success: true, username })
})



// LOGOUT
app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true })
  })
})

// CHECK SESSION
app.get("/me", (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user })
  } else {
    res.json({ loggedIn: false })
  }
})

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: "Unauthorized" })
  }
  next()
}

// -------- RSVPs --------
// Results: only current user's RSVPs
// Get RSVPs for logged-in user
app.get("/results", requireLogin, async (req, res) => {
  try {
    const username = req.session.user.username;

    const data = await rsvps.find({ username }).toArray();

    res.json(data);
  } catch (err) {
    console.error("Error fetching results:", err);
    res.status(500).json({ error: "Failed to fetch results" });
  }
});




// Submit new RSVP
app.post("/submit", requireLogin, async (req, res) => {
  try {
    const numAdditional = parseInt(req.body.numAdditional) || 0;
    const totalGuests = numAdditional + 1; // include the main guest

    const rsvp = {
      yourname: req.body.yourname,
      event: req.body.event,
      numAdditional,
      totalGuests,
      phoneNumber: req.body.phoneNumber,
      emailAddress: req.body.emailAddress,
      username: req.session.user.username,
    };

    await rsvps.insertOne(rsvp);
    res.json({ success: true });
  } catch (err) {
    console.error("Error saving RSVP:", err);
    res.status(500).json({ success: false, error: "Failed to save RSVP" });
  }
});


// Edit RSVP
app.post("/edit", requireLogin, async (req, res) => {
  const { id, updated } = req.body
  updated.totalGuests = (parseInt(updated.numAdditional) || 0) + 1

  await rsvps.updateOne(
    { _id: new ObjectId(id), username: req.session.user.username },
    { $set: updated }
  )

  const data = await rsvps.find({ username: req.session.user.username }).toArray()
  res.json(data)
})

// Delete RSVP
app.post("/delete", requireLogin, async (req, res) => {
  const { id } = req.body
  await rsvps.deleteOne({ _id: new ObjectId(id), username: req.session.user.username })

  const data = await rsvps.find({ username: req.session.user.username }).toArray()
  res.json(data)
})

// Check session manually (redundant with /me but kept)
app.get("/session", (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user })
  } else {
    res.json({ loggedIn: false })
  }
})

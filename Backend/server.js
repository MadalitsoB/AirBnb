const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const OpenAI = require("openai");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const accommodationRoutes = require("./routes/accomodationRoutes");

dotenv.config();

const app = express();
const apiKey = process.env.OPENAI_API_KEY || process.env.API_KEY;
const openai = new OpenAI({ apiKey });

app.use(cors());
app.use(express.json());

connectDB();

const sampleListings = [
  {
    _id: "1",
    title: "Stylish apartment in Cape Town",
    location: "Cape Town, South Africa",
    type: "Entire apartment",
    price: 950,
    bedrooms: 2,
    bathrooms: 2,
    guests: 4,
    rating: 4.9,
    reviews: 128,
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
    ],
    host: { username: "Maya", email: "maya@example.com" },
  },
  {
    _id: "2",
    title: "Modern loft in Johannesburg",
    location: "Johannesburg, South Africa",
    type: "Private room",
    price: 680,
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    rating: 4.8,
    reviews: 96,
    images: [
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
    ],
    host: { username: "Aden", email: "aden@example.com" },
  },
  {
    _id: "3",
    title: "Beachfront villa",
    location: "Durban, South Africa",
    type: "Entire villa",
    price: 1250,
    bedrooms: 3,
    bathrooms: 2,
    guests: 5,
    rating: 5.0,
    reviews: 172,
    images: [
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=900&q=80",
    ],
    host: { username: "Lerato", email: "lerato@example.com" },
  },
];

global.demoListings = sampleListings;
global.demoUsers = [
  {
    _id: "demo-user",
    username: "student",
    email: "student@airbnb.com",
    password: "student123",
    role: "user",
  },
];

app.get("/", (req, res) => {
  res.json({
    message: "AirBnb API is running",
    apiKeyConfigured: Boolean(apiKey),
    demoMode: true,
  });
});

app.use("/api/users", userRoutes);
app.use("/api/accommodations", accommodationRoutes);

app.post("/api/chat", async (req, res) => {
  try {
    const { message, model = "gpt-4o-mini" } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "OpenAI API key is missing",
      });
    }

    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: message }],
    });

    const reply = completion.choices?.[0]?.message?.content || "No response";

    res.json({
      success: true,
      reply,
      model,
    });
  } catch (error) {
    console.error("OpenAI request failed:", error);
    res.status(500).json({
      success: false,
      message: error.message || "AI request failed",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`OpenAI configured: ${Boolean(apiKey)}`);
});

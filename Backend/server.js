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
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
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
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    ],
    host: { username: "Aden", email: "aden@example.com" },
  },
  {
    _id: "3",
    title: "Beachfront villa in Durban",
    location: "Durban, South Africa",
    type: "Entire villa",
    price: 1250,
    bedrooms: 3,
    bathrooms: 2,
    guests: 5,
    rating: 5.0,
    reviews: 172,
    images: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80",
    ],
    host: { username: "Lerato", email: "lerato@example.com" },
  },
  {
    _id: "4",
    title: "Clifftop retreat in Hermanus",
    location: "Hermanus, South Africa",
    type: "Entire home",
    price: 1380,
    bedrooms: 3,
    bathrooms: 2,
    guests: 6,
    rating: 4.9,
    reviews: 144,
    images: [
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    ],
    host: { username: "Nandi", email: "nandi@example.com" },
  },
  {
    _id: "5",
    title: "Sunset pool villa in Stellenbosch",
    location: "Stellenbosch, South Africa",
    type: "Entire villa",
    price: 1700,
    bedrooms: 4,
    bathrooms: 3,
    guests: 8,
    rating: 4.95,
    reviews: 203,
    images: [
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    ],
    host: { username: "Jason", email: "jason@example.com" },
  },
  {
    _id: "6",
    title: "Lakefront cabin near Knysna",
    location: "Knysna, South Africa",
    type: "Cabin",
    price: 1180,
    bedrooms: 2,
    bathrooms: 1,
    guests: 4,
    rating: 4.8,
    reviews: 132,
    images: [
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    ],
    host: { username: "Zanele", email: "zanele@example.com" },
  },
  {
    _id: "7",
    title: "Forest cabin in Tsitsikamma",
    location: "Tsitsikamma, South Africa",
    type: "Cabin",
    price: 980,
    bedrooms: 2,
    bathrooms: 2,
    guests: 5,
    rating: 4.7,
    reviews: 88,
    images: [
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    ],
    host: { username: "Kamohelo", email: "kamohelo@example.com" },
  },
  {
    _id: "8",
    title: "Luxury penthouse in Sandton",
    location: "Sandton, South Africa",
    type: "Entire apartment",
    price: 2100,
    bedrooms: 3,
    bathrooms: 2,
    guests: 6,
    rating: 4.96,
    reviews: 250,
    images: [
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    ],
    host: { username: "Thabo", email: "thabo@example.com" },
  },
  {
    _id: "9",
    title: "Rural farm stay in Franschhoek",
    location: "Franschhoek, South Africa",
    type: "Farm stay",
    price: 890,
    bedrooms: 2,
    bathrooms: 1,
    guests: 4,
    rating: 4.7,
    reviews: 109,
    images: [
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
    ],
    host: { username: "Leah", email: "leah@example.com" },
  },
  {
    _id: "10",
    title: "Mountain chalet in Drakensberg",
    location: "Drakensberg, South Africa",
    type: "Entire chalet",
    price: 1600,
    bedrooms: 3,
    bathrooms: 2,
    guests: 6,
    rating: 4.9,
    reviews: 176,
    images: [
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
    ],
    host: { username: "Palesa", email: "palesa@example.com" },
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

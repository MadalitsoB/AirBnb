const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("./models/user");
const Accommodation = require("./models/accommodation");

dotenv.config();

const listings = [
  {
    title: "Stylish Sea Point Apartment",
    description:
      "Wake up to sweeping Atlantic Ocean views in this beautifully designed apartment in Cape Town's vibrant Sea Point neighbourhood. Steps from the promenade, trendy restaurants, and coffee shops. The space features high ceilings, a fully equipped kitchen, and fast WiFi — perfect for couples or solo travellers.",
    location: "Sea Point, Cape Town",
    type: "Entire apartment",
    price: 1450,
    bedrooms: 2,
    bathrooms: 1,
    guests: 4,
    amenities: ["WiFi", "Kitchen", "Washer", "Air conditioning", "Ocean view", "Free parking"],
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    ],
    rating: 4.92,
    reviews: 128,
    cleaningFee: 350,
    serviceFee: 200,
    weeklyDiscount: 10,
    specificRatings: { cleanliness: 4.9, communication: 5.0, checkIn: 4.9, accuracy: 4.8, location: 5.0, value: 4.7 },
  },
  {
    title: "Luxury Beachfront Villa in Clifton",
    description:
      "One of Cape Town's most exclusive addresses. This stunning villa sits directly above Clifton 4th Beach with private access. Features a heated infinity pool, modern open-plan living, a chef's kitchen, and panoramic ocean views. Ideal for families or groups seeking the ultimate Cape Town experience.",
    location: "Clifton, Cape Town",
    type: "Entire apartment",
    price: 8500,
    bedrooms: 5,
    bathrooms: 4,
    guests: 10,
    amenities: ["Pool", "WiFi", "Kitchen", "BBQ", "Ocean view", "Beach access", "Parking", "Air conditioning"],
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
    ],
    rating: 4.98,
    reviews: 87,
    cleaningFee: 1200,
    serviceFee: 980,
    weeklyDiscount: 15,
    specificRatings: { cleanliness: 5.0, communication: 4.9, checkIn: 5.0, accuracy: 5.0, location: 5.0, value: 4.8 },
  },
  {
    title: "Trendy Maboneng Loft",
    description:
      "Stay in the heart of Joburg's most creative neighbourhood. This industrial-chic loft in Maboneng Precinct puts you steps away from galleries, markets, rooftop bars, and street art. The open-plan space has exposed brick, high ceilings, and all the modern amenities you need for a great city stay.",
    location: "Maboneng, Johannesburg",
    type: "Entire apartment",
    price: 920,
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    amenities: ["WiFi", "Kitchen", "Washer", "Air conditioning", "TV", "Coffee machine"],
    images: [
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    ],
    rating: 4.85,
    reviews: 96,
    cleaningFee: 250,
    serviceFee: 130,
    weeklyDiscount: 8,
    specificRatings: { cleanliness: 4.8, communication: 4.9, checkIn: 4.9, accuracy: 4.7, location: 4.9, value: 4.8 },
  },
  {
    title: "Sandton Luxury Penthouse",
    description:
      "Live like royalty in this spectacular penthouse in the heart of Africa's richest square mile. Floor-to-ceiling windows, a private rooftop terrace with a plunge pool, and walking distance to Sandton City Mall and the Gautrain. Perfect for business travellers and those who want the very best.",
    location: "Sandton, Johannesburg",
    type: "Entire apartment",
    price: 3200,
    bedrooms: 3,
    bathrooms: 3,
    guests: 6,
    amenities: ["Pool", "WiFi", "Kitchen", "Gym", "Concierge", "Parking", "Air conditioning", "TV"],
    images: [
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    ],
    rating: 4.96,
    reviews: 204,
    cleaningFee: 800,
    serviceFee: 450,
    weeklyDiscount: 12,
    specificRatings: { cleanliness: 5.0, communication: 4.9, checkIn: 5.0, accuracy: 4.9, location: 4.9, value: 4.8 },
  },
  {
    title: "uShaka Beachfront Apartment",
    description:
      "Enjoy direct beach access from this beautiful apartment right on Durban's Golden Mile. Watch the Indian Ocean from your private balcony while the kids play on the beach below. Close to uShaka Marine World, the beachfront promenade, and Durban's famous street food scene.",
    location: "Golden Mile, Durban",
    type: "Entire apartment",
    price: 1150,
    bedrooms: 2,
    bathrooms: 2,
    guests: 5,
    amenities: ["Beach access", "WiFi", "Kitchen", "Pool", "Parking", "Balcony", "Air conditioning"],
    images: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
    ],
    rating: 4.88,
    reviews: 162,
    cleaningFee: 300,
    serviceFee: 180,
    weeklyDiscount: 10,
    specificRatings: { cleanliness: 4.9, communication: 4.8, checkIn: 4.9, accuracy: 4.8, location: 5.0, value: 4.7 },
  },
  {
    title: "Wine Estate Cottage in Stellenbosch",
    description:
      "Stay on a working wine farm surrounded by the breathtaking Stellenbosch mountains. This charming Cape Dutch cottage sleeps four and comes with complimentary wine tasting for guests. Explore the Cape Winelands by bike, enjoy al fresco dinners on the stoep, and wake up to mountain views every morning.",
    location: "Stellenbosch, Western Cape",
    type: "Entire apartment",
    price: 1850,
    bedrooms: 2,
    bathrooms: 1,
    guests: 4,
    amenities: ["Wine tasting", "WiFi", "Kitchen", "BBQ", "Fireplace", "Mountain view", "Parking"],
    images: [
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80",
    ],
    rating: 4.97,
    reviews: 241,
    cleaningFee: 450,
    serviceFee: 280,
    weeklyDiscount: 15,
    specificRatings: { cleanliness: 5.0, communication: 5.0, checkIn: 4.9, accuracy: 4.9, location: 5.0, value: 4.8 },
  },
  {
    title: "Clifftop Whale-Watching Retreat in Hermanus",
    description:
      "Hermanus is the whale-watching capital of the world — and this cliffside home has front-row seats. Watch southern right whales breach from your living room between June and November. The fully equipped home features a wrap-around deck, a fireplace for cool evenings, and is a short walk to the Old Harbour.",
    location: "Hermanus, Western Cape",
    type: "Entire apartment",
    price: 2100,
    bedrooms: 3,
    bathrooms: 2,
    guests: 6,
    amenities: ["Ocean view", "Fireplace", "WiFi", "Kitchen", "BBQ", "Parking", "Washer"],
    images: [
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
    ],
    rating: 4.94,
    reviews: 178,
    cleaningFee: 500,
    serviceFee: 320,
    weeklyDiscount: 12,
    specificRatings: { cleanliness: 4.9, communication: 5.0, checkIn: 4.9, accuracy: 4.9, location: 5.0, value: 4.8 },
  },
  {
    title: "Garden Route Forest Cabin near Knysna",
    description:
      "Nestled in an indigenous forest just minutes from the Knysna Lagoon, this off-the-grid cabin is a true escape. Solar power, a wood-burning fireplace, a hammock deck, and total silence except for birdsong. Explore Knysna's famous oyster bars, the Heads, and kilometres of forest hiking trails.",
    location: "Knysna, Garden Route",
    type: "Entire apartment",
    price: 1380,
    bedrooms: 2,
    bathrooms: 1,
    guests: 4,
    amenities: ["Fireplace", "WiFi", "Kitchen", "Hammock", "Forest view", "BBQ", "Parking"],
    images: [
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    ],
    rating: 4.91,
    reviews: 153,
    cleaningFee: 380,
    serviceFee: 210,
    weeklyDiscount: 10,
    specificRatings: { cleanliness: 4.9, communication: 4.9, checkIn: 4.8, accuracy: 4.9, location: 4.9, value: 4.8 },
  },
  {
    title: "Drakensberg Mountain Chalet",
    description:
      "Perched above the uKhahlamba-Drakensberg World Heritage Site, this chalet offers some of South Africa's most dramatic scenery. Giant's Castle and Monk's Cowl hiking trails are on your doorstep. A stone fireplace, stunning mountain views from every window, and starry skies that will take your breath away.",
    location: "Central Drakensberg, KwaZulu-Natal",
    type: "Entire apartment",
    price: 1750,
    bedrooms: 3,
    bathrooms: 2,
    guests: 7,
    amenities: ["Mountain view", "Fireplace", "WiFi", "Kitchen", "BBQ", "Parking", "Hiking access"],
    images: [
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
    ],
    rating: 4.93,
    reviews: 189,
    cleaningFee: 420,
    serviceFee: 260,
    weeklyDiscount: 12,
    specificRatings: { cleanliness: 4.9, communication: 4.9, checkIn: 4.8, accuracy: 4.9, location: 5.0, value: 4.8 },
  },
  {
    title: "Franschhoek Valley Farm Stay",
    description:
      "Experience the true soul of the Cape Winelands on this heritage fruit and wine farm in the Franschhoek Valley. The restored 19th-century farmhouse sleeps four and includes a private pool, a vegetable garden you can harvest from, and farm-to-table breakfasts prepared by your host each morning.",
    location: "Franschhoek, Western Cape",
    type: "Private room",
    price: 980,
    bedrooms: 2,
    bathrooms: 1,
    guests: 4,
    amenities: ["Pool", "Breakfast included", "WiFi", "Kitchen", "Mountain view", "Parking", "Garden"],
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
    ],
    rating: 4.89,
    reviews: 117,
    cleaningFee: 280,
    serviceFee: 160,
    weeklyDiscount: 10,
    specificRatings: { cleanliness: 4.9, communication: 5.0, checkIn: 4.8, accuracy: 4.8, location: 4.9, value: 4.8 },
  },
  {
    title: "Tsitsikamma Treetop Escape",
    description:
      "Suspended among the treetops of the Tsitsikamma forest, this unique treehouse-style retreat is one of the most magical stays on the entire Garden Route. Accessible via a short forest walk, the space has a glass-walled bathroom, a private deck with a hot tub, and the sound of the Storms River below.",
    location: "Tsitsikamma, Eastern Cape",
    type: "Entire apartment",
    price: 2250,
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    amenities: ["Hot tub", "Forest view", "WiFi", "Breakfast included", "Fireplace", "Parking"],
    images: [
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80",
    ],
    rating: 4.99,
    reviews: 94,
    cleaningFee: 550,
    serviceFee: 340,
    weeklyDiscount: 8,
    specificRatings: { cleanliness: 5.0, communication: 5.0, checkIn: 5.0, accuracy: 5.0, location: 5.0, value: 4.9 },
  },
  {
    title: "Waterfront Studio in the V&A",
    description:
      "Fall asleep to the gentle sounds of the harbour in this sleek studio right at Cape Town's iconic V&A Waterfront. You are surrounded by world-class restaurants, the Two Oceans Aquarium, the Cape Wheel, and daily boat trips to Robben Island. Table Mountain is the backdrop from your window.",
    location: "V&A Waterfront, Cape Town",
    type: "Entire apartment",
    price: 1680,
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    amenities: ["Harbour view", "WiFi", "Kitchen", "Air conditioning", "Gym access", "TV", "Concierge"],
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    ],
    rating: 4.95,
    reviews: 312,
    cleaningFee: 400,
    serviceFee: 260,
    weeklyDiscount: 10,
    specificRatings: { cleanliness: 5.0, communication: 4.9, checkIn: 4.9, accuracy: 5.0, location: 5.0, value: 4.8 },
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // Clear existing data
    await Accommodation.deleteMany({});
    console.log("🗑️  Cleared existing accommodations");

    // Create or find seed host user
    let host = await User.findOne({ email: "seed@airbnb.co.za" });
    if (!host) {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash("Seed123!", salt);
      host = await User.create({
        username: "AirbnbSA_Host",
        email: "seed@airbnb.co.za",
        password: hashed,
        role: "host",
      });
      console.log("👤 Created seed host user");
    } else {
      console.log("👤 Using existing seed host user");
    }

    // Attach host ID to all listings
    const listingsWithHost = listings.map((l) => ({ ...l, host: host._id }));

    const inserted = await Accommodation.insertMany(listingsWithHost);
    console.log(`🏠 Seeded ${inserted.length} South African listings`);

    inserted.forEach((l) => console.log(`   • ${l.title} — R${l.price}/night`));

    await mongoose.disconnect();
    console.log("\n✅ Done! Seed complete.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
}

seed();

const mongoose = require("mongoose");

const accommodationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
    },
    location: {
      type: String,
      required: [true, "Please provide a location"],
    },
    type: {
      type: String,
      enum: ["Entire apartment", "Private room", "Shared room", "Hotel room"],
      required: [true, "Please specify accommodation type"],
    },
    price: {
      type: Number,
      required: [true, "Please provide a nightly price"],
    },
    bedrooms: {
      type: Number,
      required: [true, "Please provide number of bedrooms"],
    },
    bathrooms: {
      type: Number,
      required: [true, "Please provide number of bathrooms"],
    },
    guests: {
      type: Number,
      required: [true, "Please provide max number of guests"],
    },
    amenities: [String], // ['wifi', 'kitchen', 'parking', etc]
    images: [String], // Array of image URLs
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    weeklyDiscount: {
      type: Number,
      default: 0,
    },
    cleaningFee: {
      type: Number,
      default: 0,
    },
    serviceFee: {
      type: Number,
      default: 0,
    },
    occupancyTaxes: {
      type: Number,
      default: 0,
    },
    // Reference to the host who owns this listing
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide host ID"],
    },
    // Detailed ratings breakdown
    specificRatings: {
      cleanliness: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
      checkIn: { type: Number, default: 0 },
      accuracy: { type: Number, default: 0 },
      location: { type: Number, default: 0 },
      value: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Accommodation", accommodationSchema);

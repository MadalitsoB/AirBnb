const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    // Reference to the accommodation being booked
    accommodation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Accommodation",
      required: [true, "Please provide accommodation ID"],
    },
    // Reference to the guest making the reservation
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide guest ID"],
    },
    checkInDate: {
      type: Date,
      required: [true, "Please provide check-in date"],
    },
    checkOutDate: {
      type: Date,
      required: [true, "Please provide check-out date"],
    },
    numberOfGuests: {
      type: Number,
      required: [true, "Please provide number of guests"],
    },
    totalPrice: {
      type: Number,
      required: [true, "Please provide total price"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    // Breakdown of all costs
    priceBreakdown: {
      nightlyRate: {
        type: Number,
        required: true,
      },
      numberOfNights: {
        type: Number,
        required: true,
      },
      subtotal: {
        type: Number,
        required: true,
      },
      weeklyDiscount: {
        type: Number,
        default: 0,
      },
      cleaningFee: {
        type: Number,
        required: true,
      },
      serviceFee: {
        type: Number,
        required: true,
      },
      occupancyTaxes: {
        type: Number,
        required: true,
      },
      total: {
        type: Number,
        required: true,
      },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Reservation", reservationSchema);

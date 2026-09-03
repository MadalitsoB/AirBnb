const Reservation = require("../models/reservation");
const Accommodation = require("../models/accommodation");
const mongoose = require("mongoose");

// @desc    Create reservation
// @route   POST /api/reservations
// @access  Private (guests only)
exports.createReservation = async (req, res) => {
  try {
    const { accommodation, checkInDate, checkOutDate, numberOfGuests } =
      req.body;

    // Validate input
    if (!accommodation || !checkInDate || !checkOutDate || !numberOfGuests) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide accommodation, checkInDate, checkOutDate, and numberOfGuests",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(accommodation)) {
      return res.status(400).json({
        success: false,
        message: "Invalid accommodation ID",
      });
    }

    const parsedGuests = Number(numberOfGuests);
    if (!Number.isInteger(parsedGuests) || parsedGuests < 1) {
      return res.status(400).json({
        success: false,
        message: "Number of guests must be a positive whole number",
      });
    }

    const accommodationData = await Accommodation.findById(accommodation);
    if (!accommodationData) {
      return res.status(404).json({
        success: false,
        message: "Accommodation not found",
      });
    }

    // Calculate number of nights
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid check-in and check-out dates",
      });
    }
    const numberOfNights = Math.ceil(
      (checkOut - checkIn) / (1000 * 60 * 60 * 24),
    );

    // Validate dates
    if (numberOfNights <= 0) {
      return res.status(400).json({
        success: false,
        message: "Check-out date must be after check-in date",
      });
    }

    if (parsedGuests > accommodationData.guests) {
      return res.status(400).json({
        success: false,
        message: `This accommodation allows a maximum of ${accommodationData.guests} guests`,
      });
    }

    // Always calculate prices from trusted listing data, never from the client.
    const subtotal = accommodationData.price * numberOfNights;
    const weeklyDiscount =
      numberOfNights >= 7
        ? (subtotal * accommodationData.weeklyDiscount) / 100
        : 0;
    const cleaningFee = accommodationData.cleaningFee;
    const serviceFee = accommodationData.serviceFee;
    const occupancyTaxes = accommodationData.occupancyTaxes;
    const totalPrice =
      subtotal - weeklyDiscount + cleaningFee + serviceFee + occupancyTaxes;

    // Create reservation
    const reservation = await Reservation.create({
      accommodation,
      guest: req.user.id, // Current logged-in user is the guest
      checkInDate,
      checkOutDate,
      numberOfGuests: parsedGuests,
      totalPrice,
      priceBreakdown: {
        nightlyRate: accommodationData.price,
        numberOfNights,
        subtotal,
        weeklyDiscount,
        cleaningFee,
        serviceFee,
        occupancyTaxes,
        total: totalPrice,
      },
    });

    res.status(201).json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all reservations for current user (as guest)
// @route   GET /api/reservations/user
// @access  Private
exports.getUserReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ guest: req.user.id })
      .populate("accommodation")
      .populate("guest", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all reservations for current user's accommodations (as host)
// @route   GET /api/reservations/host
// @access  Private
exports.getHostReservations = async (req, res) => {
  try {
    const hostListings = (global.demoListings || []).filter((listing) => {
      const ownerId =
        typeof listing.host === "object" ? listing.host?._id : listing.host;
      return ownerId === req.user.id;
    });
    const hostListingIds = new Set(hostListings.map((listing) => listing._id));
    const demoReservations = (global.demoReservations || []).filter(
      (reservation) => {
        const accommodationId =
          typeof reservation.accommodation === "object"
            ? reservation.accommodation?._id
            : reservation.accommodation;
        return hostListingIds.has(accommodationId);
      },
    );
    if (demoReservations.length || global.demoReservations) {
      return res.status(200).json({
        success: true,
        count: demoReservations.length,
        data: demoReservations,
      });
    }

    // Find all accommodations owned by this host
    const accommodations = await Accommodation.find(
      req.user.role === "admin" ? {} : { host: req.user.id },
    );
    const accommodationIds = accommodations.map((acc) => acc._id);

    // Find all reservations for these accommodations
    const reservations = await Reservation.find({
      accommodation: { $in: accommodationIds },
    })
      .populate("accommodation")
      .populate("guest", "username email");

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single reservation by ID
// @route   GET /api/reservations/:id
// @access  Private
exports.getReservation = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid reservation ID" });
    }
    const reservation = await Reservation.findById(req.params.id)
      .populate("accommodation")
      .populate("guest", "username email");

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    const isGuest = reservation.guest._id.toString() === req.user.id;
    const isHost = reservation.accommodation.host.toString() === req.user.id;
    if (!isGuest && !isHost && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this reservation",
      });
    }

    res.status(200).json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateReservationStatus = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid reservation ID" });
    }
    const { status } = req.body;
    if (!["pending", "confirmed", "cancelled", "completed"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid reservation status" });
    }

    const demoReservation = (global.demoReservations || []).find(
      (item) => item._id === req.params.id,
    );
    if (demoReservation) {
      const accommodation = demoReservation.accommodation;
      const ownerId =
        typeof accommodation?.host === "object"
          ? accommodation.host?._id
          : accommodation?.host;
      if (req.user.role !== "admin" && ownerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this reservation",
        });
      }
      demoReservation.status = status;
      return res.status(200).json({ success: true, data: demoReservation });
    }

    const reservation = await Reservation.findById(req.params.id).populate(
      "accommodation",
    );
    if (!reservation)
      return res
        .status(404)
        .json({ success: false, message: "Reservation not found" });
    if (
      req.user.role !== "admin" &&
      reservation.accommodation.host.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this reservation",
      });
    }
    reservation.status = status;
    await reservation.save();
    res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete/Cancel reservation
// @route   DELETE /api/reservations/:id
// @access  Private (guest or host can cancel)
exports.deleteReservation = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid reservation ID" });
    }
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    // Check if user is the guest or the host of the accommodation
    const accommodation = await Accommodation.findById(
      reservation.accommodation,
    );

    const isGuest = reservation.guest.toString() === req.user.id;
    const isHost =
      accommodation && accommodation.host.toString() === req.user.id;

    if (!isGuest && !isHost && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this reservation",
      });
    }

    // Delete the reservation
    await Reservation.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Reservation cancelled successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

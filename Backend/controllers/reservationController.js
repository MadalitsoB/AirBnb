const Reservation = require("../models/reservation");
const Accommodation = require("../models/accommodation");

// @desc    Create reservation
// @route   POST /api/reservations
// @access  Private (guests only)
exports.createReservation = async (req, res) => {
  try {
    const {
      accommodation,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      priceBreakdown,
    } = req.body;

    // Validate input
    if (!accommodation || !checkInDate || !checkOutDate || !numberOfGuests) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide accommodation, checkInDate, checkOutDate, and numberOfGuests",
      });
    }

    // Check if accommodation exists
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

    // Calculate total price if not provided
    let totalPrice = priceBreakdown?.total;
    if (!totalPrice) {
      const subtotal = accommodationData.price * numberOfNights;

      // Apply weekly discount if booking is 7+ nights
      const weeklyDiscount =
        numberOfNights >= 7
          ? (subtotal * accommodationData.weeklyDiscount) / 100
          : 0;

      const cleaningFee = accommodationData.cleaningFee;
      const serviceFee = accommodationData.serviceFee;
      const occupancyTaxes = accommodationData.occupancyTaxes;

      totalPrice =
        subtotal - weeklyDiscount + cleaningFee + serviceFee + occupancyTaxes;
    }

    // Create reservation
    const reservation = await Reservation.create({
      accommodation,
      guest: req.user.id, // Current logged-in user is the guest
      checkInDate,
      checkOutDate,
      numberOfGuests,
      totalPrice,
      priceBreakdown: priceBreakdown || {
        nightlyRate: accommodationData.price,
        numberOfNights,
        subtotal: accommodationData.price * numberOfNights,
        weeklyDiscount:
          numberOfNights >= 7
            ? (accommodationData.price *
                numberOfNights *
                accommodationData.weeklyDiscount) /
              100
            : 0,
        cleaningFee: accommodationData.cleaningFee,
        serviceFee: accommodationData.serviceFee,
        occupancyTaxes: accommodationData.occupancyTaxes,
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

// @desc    Get all reservations for current user's accommodations (as host)
// @route   GET /api/reservations/host
// @access  Private
exports.getHostReservations = async (req, res) => {
  try {
    // Find all accommodations owned by this host
    const accommodations = await Accommodation.find({ host: req.user.id });
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
    const reservation = await Reservation.findById(req.params.id)
      .populate("accommodation")
      .populate("guest", "username email");

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
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

// @desc    Delete/Cancel reservation
// @route   DELETE /api/reservations/:id
// @access  Private (guest or host can cancel)
exports.deleteReservation = async (req, res) => {
  try {
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
    const isHost = accommodation.host.toString() === req.user.id;

    if (!isGuest && !isHost) {
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

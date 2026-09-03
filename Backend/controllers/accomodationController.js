const Accommodation = require("../models/accommodation");
const User = require("../models/user");

// @desc    Create accommodation listing
// @route   POST /api/accommodations
// @access  Private (any logged-in user — auto-promoted to host)
exports.createAccommodation = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      type,
      price,
      bedrooms,
      bathrooms,
      guests,
      amenities,
      images,
      weeklyDiscount,
      cleaningFee,
      serviceFee,
      occupancyTaxes,
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !location ||
      !type ||
      !price ||
      bedrooms === undefined ||
      bathrooms === undefined ||
      !guests
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: title, description, location, type, price, bedrooms, bathrooms, guests",
      });
    }

    // Auto-promote user to host if they aren't already
    if (req.user.role !== "host" && req.user.role !== "admin") {
      await User.findByIdAndUpdate(req.user.id, { role: "host" });
    }

    // Create accommodation with host ID from authenticated user
    const accommodation = await Accommodation.create({
      title,
      description,
      location,
      type,
      price,
      bedrooms,
      bathrooms,
      guests,
      amenities: amenities || [],
      images: images || [],
      weeklyDiscount: weeklyDiscount || 0,
      cleaningFee: cleaningFee || 0,
      serviceFee: serviceFee || 0,
      occupancyTaxes: occupancyTaxes || 0,
      host: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: accommodation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all accommodations (with optional location filter)
// @route   GET /api/accommodations
// @access  Public
exports.getAccommodations = async (req, res) => {
  try {
    const { location } = req.query;

    let query = {};

    // If location query param provided, filter by it
    if (location) {
      query.location = { $regex: location, $options: "i" }; // Case-insensitive search
    }

    const accommodations = await Accommodation.find(query).populate(
      "host",
      "username email",
    );

    res.status(200).json({
      success: true,
      count: accommodations.length,
      data: accommodations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single accommodation by ID
// @route   GET /api/accommodations/:id
// @access  Public
exports.getAccommodation = async (req, res) => {
  try {
    const accommodation = await Accommodation.findById(req.params.id).populate(
      "host",
      "username email",
    );

    if (!accommodation) {
      return res.status(404).json({
        success: false,
        message: "Accommodation not found",
      });
    }

    res.status(200).json({
      success: true,
      data: accommodation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update accommodation
// @route   PUT /api/accommodations/:id
// @access  Private (only host who owns it)
exports.updateAccommodation = async (req, res) => {
  try {
    const demoIndex = (global.demoListings || []).findIndex(
      (item) => item._id === req.params.id,
    );
    if (demoIndex !== -1) {
      const demoListing = global.demoListings[demoIndex];
      if (demoListing.host !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this accommodation",
        });
      }
      global.demoListings[demoIndex] = {
        ...demoListing,
        ...req.body,
        _id: demoListing._id,
        host: demoListing.host,
      };
      return res
        .status(200)
        .json({ success: true, data: global.demoListings[demoIndex] });
    }

    let accommodation = await Accommodation.findById(req.params.id);

    if (!accommodation) {
      return res.status(404).json({
        success: false,
        message: "Accommodation not found",
      });
    }

    // Check if current user is the host
    if (accommodation.host.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this accommodation",
      });
    }

    // Update the accommodation with new data
    accommodation = await Accommodation.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // Return updated document
        runValidators: true, // Run model validators
      },
    );

    res.status(200).json({
      success: true,
      data: accommodation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete accommodation
// @route   DELETE /api/accommodations/:id
// @access  Private (only host who owns it)
exports.deleteAccommodation = async (req, res) => {
  try {
    const demoIndex = (global.demoListings || []).findIndex(
      (item) => item._id === req.params.id,
    );
    if (demoIndex !== -1) {
      const demoListing = global.demoListings[demoIndex];
      if (demoListing.host !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to delete this accommodation",
        });
      }
      global.demoListings.splice(demoIndex, 1);
      return res
        .status(200)
        .json({ success: true, message: "Accommodation deleted successfully" });
    }

    const accommodation = await Accommodation.findById(req.params.id);

    if (!accommodation) {
      return res.status(404).json({
        success: false,
        message: "Accommodation not found",
      });
    }

    // Check if current user is the host
    if (accommodation.host.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this accommodation",
      });
    }

    // Delete the accommodation
    await Accommodation.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Accommodation deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

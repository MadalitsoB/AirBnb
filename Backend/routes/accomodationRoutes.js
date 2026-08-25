const express = require("express");
const {
  createAccommodation,
  getAccommodations,
  getAccommodation,
  updateAccommodation,
  deleteAccommodation,
} = require("../controllers/accomodationController");
const { protect } = require("../middleware/authmiddleware");

const router = express.Router();

// Public routes
router.get("/", getAccommodations);
router.get("/:id", getAccommodation);

// Protected routes (require authentication)
router.post("/", protect, createAccommodation);
router.put("/:id", protect, updateAccommodation);
router.delete("/:id", protect, deleteAccommodation);

module.exports = router;

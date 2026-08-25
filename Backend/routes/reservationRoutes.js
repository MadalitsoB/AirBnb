const express = require("express");
const {
  createReservation,
  getUserReservations,
  getHostReservations,
  getReservation,
  deleteReservation,
} = require("../controllers/reservationController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// All reservation routes are protected (require authentication)
router.post("/", protect, createReservation);
router.get("/user", protect, getUserReservations);
router.get("/host", protect, getHostReservations);
router.get("/:id", protect, getReservation);
router.delete("/:id", protect, deleteReservation);

module.exports = router;

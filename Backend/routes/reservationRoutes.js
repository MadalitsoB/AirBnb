const express = require("express");
const {
  createReservation,
  getUserReservations,
  getHostReservations,
  getReservation,
  deleteReservation,
} = require("../controllers/reservationController");
const { protect } = require("../middleware/authmiddleware");

const router = express.Router();

const hostOnly = (req, res, next) => {
  if (!["host", "admin"].includes(req.user?.role)) {
    return res
      .status(403)
      .json({ success: false, message: "Host access required" });
  }
  next();
};

// All reservation routes are protected (require authentication)
router.post("/", protect, createReservation);
router.get("/user", protect, getUserReservations);
router.get("/host", protect, hostOnly, getHostReservations);
router.get("/:id", protect, getReservation);
router.delete("/:id", protect, deleteReservation);

module.exports = router;

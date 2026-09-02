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
const hostOnly = (req, res, next) => {
  if (!["host", "admin"].includes(req.user?.role)) {
    return res
      .status(403)
      .json({ success: false, message: "Host access required" });
  }
  next();
};

router.get("/", (req, res) => {
  return getAccommodations(req, res);
});

router.get("/:id", (req, res) => {
  return getAccommodation(req, res);
});

router.post("/", protect, hostOnly, createAccommodation);
router.put("/:id", protect, hostOnly, updateAccommodation);
router.delete("/:id", protect, hostOnly, deleteAccommodation);

module.exports = router;

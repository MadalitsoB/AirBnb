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
  res.json({
    success: true,
    count: (global.demoListings || []).length,
    data: global.demoListings || [],
  });
});

router.get("/:id", (req, res) => {
  const listing = (global.demoListings || []).find(
    (item) => item._id === req.params.id,
  );

  if (!listing) {
    return res.status(404).json({
      success: false,
      message: "Accommodation not found",
    });
  }

  res.json({ success: true, data: listing });
});

router.post("/", protect, hostOnly, createAccommodation);
router.put("/:id", protect, hostOnly, updateAccommodation);
router.delete("/:id", protect, hostOnly, deleteAccommodation);

module.exports = router;

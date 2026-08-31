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

router.post("/", protect, createAccommodation);
router.put("/:id", protect, updateAccommodation);
router.delete("/:id", protect, deleteAccommodation);

module.exports = router;

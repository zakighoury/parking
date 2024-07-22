const express = require("express");
const router = express.Router();
const Building = require("../models/Building");
const User = require("../models/User")
const cloudinary = require("cloudinary").v2;
const Booking = require("../models/Booking");
const { requireSignin } = require('../middlewares/authmiddleware');
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

// Making a upload Variable
const upload = multer({ storage: storage });
const getRoleFromHeaders = (req) => req.headers['x-user-role'];
router.post("/buildings", upload.single("ImgUrl"), async (req, res) => {
  try {
    // Upload image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(req.file.path);
    console.log(uploadResponse)
    // Create a new Building instance with Cloudinary URL
    const { name, address, description, floors, slots, provider, price } = req.body;
    const building = new Building({
      ImgUrl: uploadResponse.secure_url, // Store the secure URL from Cloudinary
      name,
      address,
      description,
      provider,
      available: true,
      floors: JSON.parse(floors),
      slots: [],
      price
    });

    // Save the building to MongoDB
    const savedBuilding = await building.save();
    console.log("🚀 ~ router.post ~ building:", building)
    res.status(201).json(savedBuilding);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// GET /api/buildings - Get all buildings
router.get("/buildings", requireSignin, async (req, res) => {
  try {
    const role = getRoleFromHeaders(req);
    console.log(role, "role");
    let buildings;

    if (role === 'provider') {
      buildings = await Building.find();
    } else if (role === 'customer') {
      // Customer sees only buildings that have not been bought
      buildings = await Building.find({ isBought: true });
    } else {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json(buildings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get("/buildings/:id", async (req, res) => {
  try {
    const building = await Building.findById(req.params.id).populate("floors.slots.reservedBy", "name email");
    if (!building) {
      return res.status(404).json({ message: "Building not found" });
    }
    res.json(building);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// router.post('/buildings/:id/reserve', async (req, res) => {
//   const { id } = req.params;
//   const { floorNumber, slotNumber, time, vehicleType, paymentInfo } = req.body;

//   try {
//     // Check if the slot is available
//     const existingBooking = await Booking.findOne({
//       buildingId: id,
//       floorNumber,
//       slotNumber,
//       time: { $elemMatch: { $gte: time[0], $lt: time[1] } }
//     });

//     if (existingBooking) {
//       return res.status(400).json({ error: 'Slot is already booked during this time.' });
//     }

//     // Create a new booking
//     const newBooking = new Booking({
//       buildingId: id,
//       floorNumber,
//       slotNumber,
//       time,
//       vehicleType,
//       paymentInfo
//     });

//     await newBooking.save();

//     // Update the building's slot availability (optional)
//     const building = await Building.findById(id);
//     const floor = building.floors.find(f => f.number === +floorNumber);
//     const slot = floor.slots.find(s => s.number === +slotNumber);
//     slot.isReserved = true;
//     await building.save();


//     res.status(201).json(newBooking);
//     console.log(newBooking,"new")
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });
// Get building details
module.exports = router;

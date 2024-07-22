const express = require('express');
const router = express.Router();
const Building = require('../models/Building');
const Transaction = require('../models/Transaction');
const { io } = require('../index');
const { sendEmail } = require('../config/nodemailerConfig');
const { requireSignin } = require('../middlewares/authmiddleware');

// Fetch building details
router.get('/:id', async (req, res) => {
  try {
    const building = await Building.findById(req.params.id);
    if (!building) return res.status(404).json({ error: 'Building not found' });
    res.json(building);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/reserve', requireSignin, async (req, res) => {
  const { floorNumber, slotNumber, reservationTime, vehicleType } = req.body;

  try {
    const building = await Building.findById(req.params.id);
    if (!building) return res.status(404).json({ error: 'Building not found' });

    const floor = building.floors.find(f => f.number === floorNumber);
    if (!floor) return res.status(404).json({ error: 'Floor not found' });

    const slot = floor.slots.find(s => s.number === slotNumber);
    if (!slot) return res.status(404).json({ error: 'Slot not found' });

    if (slot.isReserved) return res.status(400).json({ error: 'Slot already reserved' });

    slot.isReserved = true;
    slot.reservationTime = reservationTime;
    slot.vehicleType = vehicleType;
    await building.save();

    io.emit('emailNotification', { type: 'reserveSlot', floorNumber, slotNumber });
    await sendEmail(
      req.user.email,
      'Slot Reservation Confirmation',
      `Your reservation for Floor ${floorNumber}, Slot ${slotNumber} has been confirmed.`
    );

    res.json({ message: 'Slot reserved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


// Route to cancel a reservation
router.post('/:id/cancel', requireSignin, async (req, res) => {
  const { floorNumber, slotNumber } = req.body;

  try {
    const building = await Building.findById(req.params.id);
    if (!building) return res.status(404).json({ error: 'Building not found' });

    const floor = building.floors.find(f => f.number === floorNumber);
    if (!floor) return res.status(404).json({ error: 'Floor not found' });

    const slot = floor.slots.find(s => s.number === slotNumber);
    if (!slot) return res.status(404).json({ error: 'Slot not found' });

    if (!slot.isReserved) return res.status(400).json({ error: 'Slot is not reserved' });

    slot.isReserved = false;
    await building.save();

    io.emit('emailNotification', { type: 'cancelReservation', floorNumber, slotNumber });
    await sendEmail(
      req.user.email,
      'Reservation Cancellation Confirmation',
      `Your reservation for Floor ${floorNumber}, Slot ${slotNumber} has been cancelled.`
    );

    res.json(building);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to buy a building
router.post('/:id/buy', requireSignin, async (req, res) => {
  const { providerName, phoneNumber, price } = req.body;

  try {
    const building = await Building.findById(req.params.id);
    if (!building) return res.status(404).json({ message: 'Building not found' });
    if (building.isBought) return res.status(400).json({ message: 'Building already bought' });

    building.isBought = true;
    building.providerName = providerName;
    building.phoneNumber = phoneNumber;
    await building.save();

    const transaction = new Transaction({
      providerName,
      phoneNumber,
      buildingId: building._id,
      price,
    });
    await transaction.save();

    io.emit('emailNotification', { type: 'buyBuilding' });

    await sendEmail(
      req.user.email,
      'Building Purchase Confirmation',
      `Congratulations! You have successfully purchased the building. Price: ${price}`
    );

    res.json({ message: 'Building purchased successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to buy a floor
router.post('/:id/buyFloor', requireSignin, async (req, res) => {
  const { floorNumber, price } = req.body;

  try {
    const building = await Building.findById(req.params.id);
    if (!building) return res.status(404).json({ message: 'Building not found' });

    const floor = building.floors.find(f => f.number === floorNumber);
    if (!floor) return res.status(404).json({ message: 'Floor not found' });

    if (floor.isBought) return res.status(400).json({ message: 'Floor already bought' });

    floor.isBought = true;
    await building.save();

    io.emit('emailNotification', { type: 'buyFloor' });

    await sendEmail(
      req.user.email,
      'Floor Purchase Confirmation',
      `Congratulations! You have successfully purchased the floor. Price: ${price}`
    );

    res.json({ message: 'Floor purchased successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to leave a building
router.post('/:id/leave', requireSignin, async (req, res) => {
  const { leaveReason } = req.body;

  try {
    const building = await Building.findById(req.params.id);
    if (!building) return res.status(404).json({ error: 'Building not found' });

    if (!building.isBought) return res.status(400).json({ error: 'Building not bought' });

    building.isBought = false;
    building.providerName = null;
    building.phoneNumber = null;
    building.price = 0;

    await building.save();

    io.emit('emailNotification', { type: 'leaveBuilding', leaveReason });

    await sendEmail(
      req.user.email,
      'Building Leave Confirmation',
      `You have successfully left the building. Reason: ${leaveReason}`
    );

    res.json(building);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

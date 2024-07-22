// routes/buildings.js
const express = require('express');
const router = express.Router();
const Building = require('../models/Building');

// Get all buildings
router.get('/all', async (req, res) => {
  try {
    const buildings = await Building.find({ isBought: true });
    res.json(buildings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get('/all/reserve', async (req, res) => {
  try {
    const buildings = await Building.find({ isBought: true });
    res.json(buildings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update building
router.put('/:id', async (req, res) => {
  try {
    const building = await Building.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(building);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete building
router.delete('/:id', async (req, res) => {
  try {
    await Building.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update floor
router.put('/:buildingId/floors/:floorNumber', async (req, res) => {
  try {
    const building = await Building.findOne({ _id: req.params.buildingId });
    const floor = building.floors.id(req.params.floorNumber);
    Object.assign(floor, req.body);
    await building.save();
    res.json(building);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete floor
router.delete('/:buildingId/floors/:floorNumber', async (req, res) => {
  try {
    const building = await Building.findOne({ _id: req.params.buildingId });
    building.floors.id(req.params.floorNumber).remove();
    await building.save();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update slot
router.put('/:buildingId/floors/:floorNumber/slots/:slotNumber', async (req, res) => {
  try {
    const building = await Building.findOne({ _id: req.params.buildingId });
    const floor = building.floors.id(req.params.floorNumber);
    const slot = floor.slots.id(req.params.slotNumber);
    Object.assign(slot, req.body);
    await building.save();
    res.json(building);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete slot
router.delete('/:buildingId/floors/:floorNumber/slots/:slotNumber', async (req, res) => {
  try {
    const building = await Building.findOne({ _id: req.params.buildingId });
    const floor = building.floors.id(req.params.floorNumber);
    floor.slots.id(req.params.slotNumber).remove();
    await building.save();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

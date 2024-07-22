const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  number: Number,
  available: Boolean,
  reservedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  isReserved: Boolean,
});

const floorSchema = new mongoose.Schema({
  number: Number,
  slots: [slotSchema],
  isBought: {
    type: Boolean,
    default: false,
  },
});

const feedbackSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  comment: String,
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
});

const buildingSchema = new mongoose.Schema({
  name: String,
  address: String,
  description: String,
  ImgUrl: String,
  price:Number,
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['available', 'reserved'],
    default: 'available',
  },
  available: Boolean,
  isBought: {
    type: Boolean,
    default: false,
  },
  providerName: String,
  phoneNumber: String,
  reservationRules: {
    maxReservationTime: Number, // Time in minutes
    blackoutPeriods: [
      {
        start: Date,
        end: Date,
      },
    ],
  },
  floors: [floorSchema],
  feedback: [feedbackSchema],
});

const Building = mongoose.model('Building', buildingSchema);
module.exports = Building;

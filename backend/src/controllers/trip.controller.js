const tripService = require("../services/trip.service");
const { serializePrisma } = require("../utils/prismaSerializer");

exports.getAllTrips = async (req, res) => {
  try {
    const result = await tripService.getAllTrips(req.user.id);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTripById = async (req, res) => {
  try {
    const result = await tripService.getTripById(req.params.id, req.user.id);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.createTrip = async (req, res) => {
  try {
    const result = await tripService.createTrip(req.user.id, req.body);
    res.status(201).json(serializePrisma(result));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateTrip = async (req, res) => {
  try {
    const result = await tripService.updateTrip(req.params.id, req.user.id, req.body);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteTrip = async (req, res) => {
  try {
    const result = await tripService.deleteTrip(req.params.id, req.user.id);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.addPlaceToTrip = async (req, res) => {
  try {
    const result = await tripService.addPlaceToTrip(req.params.id, req.user.id, req.body);
    res.status(201).json(serializePrisma(result));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.removePlaceFromTrip = async (req, res) => {
  try {
    const result = await tripService.removePlaceFromTrip(req.params.id, req.user.id, req.params.place_id);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const checkinService = require("../services/checkin.service");
const { serializePrisma } = require("../utils/prismaSerializer");

exports.getCheckins = async (req, res) => {
  try {
    const result = await checkinService.getCheckins(req.user.id);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addCheckin = async (req, res) => {
  try {
    const { place_id, latitude, longitude } = req.body;
    const result = await checkinService.addCheckin(req.user.id, place_id, latitude, longitude);
    res.status(201).json(serializePrisma(result));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

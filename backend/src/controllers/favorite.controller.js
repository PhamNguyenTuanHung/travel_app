const favoriteService = require("../services/favorite.service");
const { serializePrisma } = require("../utils/prismaSerializer");

exports.getFavorites = async (req, res) => {
  try {
    const result = await favoriteService.getFavorites(req.user.id);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addFavorite = async (req, res) => {
  try {
    const { place_id } = req.body;
    const result = await favoriteService.addFavorite(req.user.id, place_id);
    res.status(201).json(serializePrisma(result));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const result = await favoriteService.removeFavorite(req.user.id, req.body.place_id);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

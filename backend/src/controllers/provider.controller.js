const providerService = require("../services/provider.service");
const { serializePrisma } = require("../utils/prismaSerializer");

exports.getAllProviders = async (req, res) => {
  try {
    const result = await providerService.getAllProviders(req.query);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProviderById = async (req, res) => {
  try {
    const result = await providerService.getProviderById(req.params.id);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.createProvider = async (req, res) => {
  try {
    const result = await providerService.createProvider(req.body);
    res.status(201).json(serializePrisma(result));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateProvider = async (req, res) => {
  try {
    const result = await providerService.updateProvider(req.params.id, req.body);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteProvider = async (req, res) => {
  try {
    const result = await providerService.deleteProvider(req.params.id);
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

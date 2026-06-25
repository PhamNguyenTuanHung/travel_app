const userService = require("../services/user.service");
const { serializePrisma } = require("../utils/prismaSerializer");
const userMapper = require("../mapper/user.mapper");

const sanitizeUser = (user) => {
  if (Array.isArray(user)) return userMapper.toDTOs(user);
  return userMapper.toDTO(user);
};

exports.getUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers(req.query);
    res.json(serializePrisma(sanitizeUser(users)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json(serializePrisma(sanitizeUser(user)));
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};



exports.createUser = async (req, res) => {

  try {
    const user = await userService.createUser(req.body);

    res.status(201).json(serializePrisma(sanitizeUser(user)));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    res.json(serializePrisma(sanitizeUser(user)));
  }
  catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const result = await userService.deleteUser(req.params.id);
    res.json(serializePrisma(result));
  }
  catch (err) {
    res.status(404).json({ message: err.message });
  }
};


exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      "full_name",
      "phone",
      "avatar_url",
      "traveler_type",
      "bio"
    ];

    const updateData = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const user = await userService.updateUser(
      req.user.id,
      updateData
    );

    res.json(serializePrisma(sanitizeUser(user)));
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.id);
    res.json(serializePrisma(sanitizeUser(user)));
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const {
      old_password: oldPassword,
      new_password: newPassword
    } = req.body;
    const result = await userService.updatePassword(req.user.id, oldPassword, newPassword);
    if (result.user) {
      result.user = sanitizeUser(result.user);
    }
    res.json(serializePrisma(result));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

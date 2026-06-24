const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const protect = require("../middlewares/protect.middleware");
const antiRoleEscalation = require("../middlewares/antiRoleEscalation.middleware");

// Tạo user
router.post("/", protect.userCreate, userController.createUser);

router.get("/", protect.userRead, userController.getUsers);

router.get("/:id", protect.userRead, userController.getUserById);

router.put("/:id", protect.userUpdate, userController.updateUser);

router.delete("/:id", protect.userDelete, userController.deleteUser);

module.exports = router;
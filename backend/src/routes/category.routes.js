const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const protect = require("../middlewares/protect.middleware");

router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);
router.post("/", protect.locationCreate, categoryController.createCategory);
router.put("/:id", protect.locationUpdate, categoryController.updateCategory);
router.delete("/:id", protect.locationDelete, categoryController.deleteCategory);

module.exports = router;

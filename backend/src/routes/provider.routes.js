const express = require("express");
const router = express.Router();
const providerController = require("../controllers/provider.controller");
const protect = require("../middlewares/protect.middleware");

router.get("/", protect.providerRead, providerController.getAllProviders);
router.get("/:id", protect.providerRead, providerController.getProviderById);
router.post("/", protect.providerCreate, providerController.createProvider);
router.put("/:id", protect.providerUpdate, providerController.updateProvider);
router.delete("/:id", protect.providerDelete, providerController.deleteProvider);

module.exports = router;

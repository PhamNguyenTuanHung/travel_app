const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const antiRoleEscalation = require('../middlewares/antiRoleEscalation.middleware');
const { auth } = require('../middlewares/protect.middleware');

// Đăng ký
router.post('/register', antiRoleEscalation, authController.register);

// Đăng nhập
router.post('/login', authController.login);

// Đăng nhập google
router.post('/google', authController.loginWithGoogle);



module.exports = router;

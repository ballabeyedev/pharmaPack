import express from "express";
const accountAdminController = require('../../controllers/admin/account.controller');

const router = express.Router();

// 📩 Demande de reset
router.post("/password-oublie", accountAdminController.passwordOublie);

// 🔐 Reset password avec token
router.post("/reset-password/:token", accountAdminController.resetPassword);

module.exports = router; 
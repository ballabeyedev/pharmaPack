const express = require('express');
const router = express.Router();

const accountAdminController = require('../../controllers/admin/account.controller');

// 📩 Demande de reset password
router.post('/password-oublie', accountAdminController.passwordOublie);

// 🔐 Reset password avec token
router.post('/reset-password/:token', accountAdminController.resetPassword);

module.exports = router;
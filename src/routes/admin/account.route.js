import express from "express";
import AccountAdminController from "../../controllers/admin/account.controller";

const router = express.Router();

// 📩 Demande de reset
router.post("/password-oublie", AccountAdminController.passwordOublie);

// 🔐 Reset password avec token
router.post("/reset-password/:token", AccountAdminController.resetPassword);

export default router;
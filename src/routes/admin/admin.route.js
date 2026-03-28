const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin/admin.controller');
const auth = require('../../middlewares/auth.middleware');
const isAdmin = require('../../middlewares/isAdmin.middleware'); 
const checkActiveUser = require('../../middlewares/checkActiveUser.middleware');

// Middleware commun pour toutes les routes admin
router.use(auth);             // Vérifie que l'utilisateur est connecté
router.use(checkActiveUser);  // Vérifie que le compte est actif
router.use(isAdmin);          // Vérifie que c'est un admin

// -------------------- ROUTES ADMIN --------------------

// Activer un utilisateur (id passé en paramètre)
router.put('/activer-utilisateur/:id', adminController.activerUtilisateur);


module.exports = router;
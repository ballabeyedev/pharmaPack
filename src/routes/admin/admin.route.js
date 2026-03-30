const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin/admin.controller');
const auth = require('../../middlewares/auth.middleware');
const isAdmin = require('../../middlewares/isAdmin.middleware'); 
const checkActiveUser = require('../../middlewares/checkActiveUser.middleware');

// Middleware commun pour toutes les routes admin
router.use(auth);
router.use(checkActiveUser);
router.use(isAdmin);

// ─────────────────────────────────────────────
// UTILISATEURS
// ─────────────────────────────────────────────
router.put('/activer-utilisateur/:id', adminController.activerUtilisateur);
router.put('/desactiver-utilisateur/:id', adminController.desactiverUtilisateur);

// ─────────────────────────────────────────────
// PRODUITS
// ─────────────────────────────────────────────
router.get('/liste-produits', adminController.listerProduit);
router.post('/ajout-produits', adminController.ajouterProduit);
router.put('/modifier-produits/:id', adminController.modifierProduit);
router.delete('/supprimer-produits/:id', adminController.supprimerProduit);

// ─────────────────────────────────────────────
// COMMANDES
// ─────────────────────────────────────────────
router.get('/liste-commandes', adminController.listeCommandes);
router.put('/valider-commandes/:id', adminController.validerCommande);
router.put('/rejeter-commandes/:id', adminController.rejeterCommande);
router.put('/livrer-commandes/:id',  adminController.livrerCommande);

// ─────────────────────────────────────────────
// PHARMACIES
// ─────────────────────────────────────────────
router.get('/liste-pharmacies', adminController.listePharmacies);
router.get('/liste-pharmacies-enattente', adminController.listePharmaciesEnAttente);
router.put('/valider-pharmacies/:id', adminController.validerInscriptionPharmacies);
router.put('/rejeter-pharmacies/:id', adminController.rejeterInscriptionPharmacies);

// ─────────────────────────────────────────────
// AVANTAGES
// ─────────────────────────────────────────────
router.get('/liste-avantages', adminController.listeAvantages);
router.post('/ajout-avantages', adminController.ajouterAvantage);
router.put('/modifier-avantages/:id', adminController.modifierAvantage);
router.delete('supprimer-avantages/:id', adminController.supprimerAvantage);

// ─────────────────────────────────────────────
// CATÉGORIES
// ─────────────────────────────────────────────
router.get('/liste-categories',        adminController.listeCategories);
router.post('/ajout-categories',       adminController.ajouterCategorie);
router.put('/modifier-categories/:id',    adminController.modifierCategorie);
router.delete('/supprimer-categories/:id', adminController.supprimerCategorie);

// ─────────────────────────────────────────────
// NIVEAUX
// ─────────────────────────────────────────────
router.get('/liste-niveaux',        adminController.listeNiveau);
router.post('/ajout-niveaux',       adminController.ajouterNiveau);
router.put('/modifier-niveaux/:id',    adminController.modifierNiveau);
router.delete('/supprimer-niveaux/:id', adminController.supprimerNiveau);

router.get('/donnee-dashboard', adminController.getDashboardStats);

module.exports = router;
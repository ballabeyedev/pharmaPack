const express = require('express');
const router = express.Router();

const PharmacieController = require('../../controllers/pharmacie/pharmacie.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

router.use(authMiddleware);


router.get(
    '/lister-produits',
    PharmacieController.listerProduits
);

router.get(
    '/rechercher-produit',
    PharmacieController.rechercherProduits
);

router.get(
    '/detail-produit/:id',
    PharmacieController.getProduit
);

router.post(
    '/passer-commande',
    PharmacieController.commander
);

router.get(
    '/commandes-livrees',
    PharmacieController.commandesLivrees
);
router.get(
    '/commandes-en-attente',
    PharmacieController.commandesEnAttente
);

router.get(
    '/nombre-de-commandes-en-attente',
    PharmacieController.nombreCommandeEnAttente
);

router.get(
    '/commandes-annulees',
    PharmacieController.commandesAnnulees
);



router.get(
    '/nombre-de-commandes-annulees',
    PharmacieController.nombreCommandeAnnulee
);
router.get(
    '/commandes-validees',
    PharmacieController.commandesValidees
);

router.get(
    '/nombre-de-commandes-validees',
    PharmacieController.nombreCommandeValidees
);
router.get(
    '/commandes-rejetees',
    PharmacieController.commandesRejetees
);

router.get(
    '/nombre-de-commandes-rejetees',
    PharmacieController.nombreCommandeRejetees
);

router.get(
    '/nombre-de-commandes-totale',
    PharmacieController.nombreTotalDeCommandes
);

router.get(
    '/detailler-commande/:id',
    PharmacieController.detailCommande
);

router.patch(
    '/annuler-commande/:id',
    PharmacieController.annulerCommande
);


module.exports = router;
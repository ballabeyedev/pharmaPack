// controllers/admin/admin.controller.js
const AdminService = require('../../services/admin/admin.service');
const formatUser = require('../../utils/formatUser');

/**
 * Activer un utilisateur
 * @route   PUT /admin/utilisateur/:id/activer
 * @access  Admin
 */
const activerUtilisateur = async (req, res) => {
  try {
    const utilisateurId = req.params.id;
    const result = await AdminService.activerUtilisateur(utilisateurId);

    if (!result.utilisateur) {
      return res.status(404).json({ message: result.message });
    }

    const utilisateurFormate = formatUser(result.utilisateur);
    return res.status(200).json({ message: result.message, utilisateur: utilisateurFormate });

  } catch (error) {
    console.error("Erreur activerUtilisateur controller :", error);
    return res.status(500).json({ message: "Erreur lors de l'activation", error: error.message });
  }
};

/**
 * Désactiver un utilisateur
 * @route   PUT /admin/utilisateur/:id/desactiver
 * @access  Admin
 */
const desactiverUtilisateur = async (req, res) => {
  try {
    const utilisateurId = req.params.id;
    const result = await AdminService.desactiverUtilisateur(utilisateurId);

    if (!result.utilisateur) {
      return res.status(404).json({ message: result.message });
    }

    const utilisateurFormate = formatUser(result.utilisateur);
    return res.status(200).json({ message: result.message, utilisateur: utilisateurFormate });

  } catch (error) {
    console.error("Erreur desactiverUtilisateur controller :", error);
    return res.status(500).json({ message: "Erreur lors de la désactivation", error: error.message });
  }
};

// ─────────────────────────────────────────────
// PRODUITS
// ─────────────────────────────────────────────

/**
 * Lister tous les produits
 * @route   GET /admin/produits
 * @access  Admin
 */
const listerProduit = async (req, res) => {
  try {
    const result = await AdminService.listerProduit();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Erreur listerProduit controller :", error);
    return res.status(500).json({ message: "Erreur lors de la récupération des produits", error: error.message });
  }
};

/**
 * Ajouter un produit
 * @route   POST /admin/produits
 * @access  Admin
 */
const ajouterProduit = async (req, res) => {
  try {
    console.log("BODY:", req.body);   // DEBUG
    console.log("FILE:", req.file);   // DEBUG

    const data = {
      ...req.body,
      image: req.file ? req.file.filename : null
    };

    const result = await AdminService.ajouterProduit(data, req.user.id);

    return res.status(201).json(result);
  } catch (error) {
    console.error("Erreur ajouterProduit controller :", error);
    return res.status(500).json({
      message: "Erreur lors de l'ajout du produit",
      error: error.message
    });
  }
};

/**
 * Modifier un produit
 * @route   PUT /admin/produits/:id
 * @access  Admin
 */
const modifierProduit = async (req, res) => {
  try {
    const result = await AdminService.modifierProduit(req.params.id, req.body, req.user.id);

    if (!result.produit) {
      return res.status(404).json({ message: result.message });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Erreur modifierProduit controller :", error);
    return res.status(500).json({ message: "Erreur lors de la modification du produit", error: error.message });
  }
};

/**
 * Supprimer un produit
 * @route   DELETE /admin/produits/:id
 * @access  Admin
 */
const supprimerProduit = async (req, res) => {
  try {
    const result = await AdminService.supprimerProduit(req.params.id, req.user.id);

    if (result.message === "Produit non trouvé") {
      return res.status(404).json({ message: result.message });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Erreur supprimerProduit controller :", error);
    return res.status(500).json({ message: "Erreur lors de la suppression du produit", error: error.message });
  }
};

// ─────────────────────────────────────────────
// COMMANDES
// ─────────────────────────────────────────────

/**
 * Lister toutes les commandes
 * @route   GET /admin/commandes
 * @access  Admin
 */
const listeCommandes = async (req, res) => {
  try {
    const result = await AdminService.listeCommandes();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Erreur listeCommandes controller :", error);
    return res.status(500).json({ message: "Erreur lors de la récupération des commandes", error: error.message });
  }
};

/**
 * Valider une commande
 * @route   PUT /admin/commandes/:id/valider
 * @access  Admin
 */
const validerCommande = async (req, res) => {
  try {
    const result = await AdminService.validerCommande(req.params.id, req.user.id);

    if (!result.commande) {
      return res.status(404).json({ message: result.message });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Erreur validerCommande controller :", error);
    return res.status(500).json({ message: "Erreur lors de la validation de la commande", error: error.message });
  }
};

/**
 * Rejeter une commande
 * @route   PUT /admin/commandes/:id/rejeter
 * @access  Admin
 */
const rejeterCommande = async (req, res) => {
  try {
    const result = await AdminService.rejeterCommande(req.params.id, req.user.id);

    if (!result.commande) {
      return res.status(404).json({ message: result.message });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Erreur rejeterCommande controller :", error);
    return res.status(500).json({ message: "Erreur lors du rejet de la commande", error: error.message });
  }
};

/**
 * Marquer une commande comme livrée
 * @route   PUT /admin/commandes/:id/livrer
 * @access  Admin
 */
const livrerCommande = async (req, res) => {
  try {
    const result = await AdminService.livrerCommande(req.params.id, req.user.id);

    if (!result.commande) {
      return res.status(404).json({ message: result.message });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Erreur livrerCommande controller :", error);
    return res.status(500).json({ message: "Erreur lors de la livraison de la commande", error: error.message });
  }
};

// ─────────────────────────────────────────────
// PHARMACIES
// ─────────────────────────────────────────────

/**
 * Lister toutes les pharmacies actives / inactives
 * @route   GET /admin/pharmacies
 * @access  Admin
 */
const listePharmacies = async (req, res) => {
  try {
    const result = await AdminService.listePharmacies();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Erreur listePharmacies controller :", error);
    return res.status(500).json({ message: "Erreur lors de la récupération des pharmacies", error: error.message });
  }
};

/**
 * Lister les pharmacies en attente de validation
 * @route   GET /admin/pharmacies/en-attente
 * @access  Admin
 */
const listePharmaciesEnAttente = async (req, res) => {
  try {
    const result = await AdminService.listePharmaciesEnAttente();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Erreur listePharmaciesEnAttente controller :", error);
    return res.status(500).json({ message: "Erreur lors de la récupération des pharmacies en attente", error: error.message });
  }
};

/**
 * Valider l'inscription d'une pharmacie
 * @route   PUT /admin/pharmacies/:id/valider
 * @access  Admin
 */
const validerInscriptionPharmacies = async (req, res) => {
  try {
    const result = await AdminService.validerInscriptionPharmacies(req.params.id, req.user.id);

    if (!result.utilisateur) {
      return res.status(404).json({ message: result.message });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Erreur validerInscriptionPharmacies controller :", error);
    return res.status(500).json({ message: "Erreur lors de la validation de l'inscription", error: error.message });
  }
};

/**
 * Rejeter l'inscription d'une pharmacie
 * @route   PUT /admin/pharmacies/:id/rejeter
 * @access  Admin
 */
const rejeterInscriptionPharmacies = async (req, res) => {
  try {
    const result = await AdminService.rejeterInscriptionPharmacies(req.params.id, req.user.id);

    if (!result.utilisateur) {
      return res.status(404).json({ message: result.message });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Erreur rejeterInscriptionPharmacies controller :", error);
    return res.status(500).json({ message: "Erreur lors du rejet de l'inscription", error: error.message });
  }
};

// ─────────────────────────────────────────────
// AVANTAGES
// ─────────────────────────────────────────────

/**
 * Lister tous les avantages
 * @route   GET /admin/avantages
 * @access  Admin
 */
const listeAvantages = async (req, res) => {
  try {
    const result = await AdminService.listeAvantages();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Erreur listeAvantages controller :", error);
    return res.status(500).json({ message: "Erreur lors de la récupération des avantages", error: error.message });
  }
};

/**
 * Ajouter un avantage
 * @route   POST /admin/avantages
 * @access  Admin
 */
const ajouterAvantage = async (req, res) => {
  try {
    const { pharmacieId, type, montant } = req.body;
    const result = await AdminService.ajouterAvantage(pharmacieId, type, montant, req.user.id);
    return res.status(201).json(result);
  } catch (error) {
    console.error("Erreur ajouterAvantage controller :", error);
    return res.status(500).json({ message: "Erreur lors de l'ajout de l'avantage", error: error.message });
  }
};

/**
 * Modifier un avantage
 * @route   PUT /admin/avantages/:id
 * @access  Admin
 */
const modifierAvantage = async (req, res) => {
  try {
    const result = await AdminService.modifierAvantage(req.params.id, req.body, req.user.id);

    if (!result.avantage) {
      return res.status(404).json({ message: result.message });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Erreur modifierAvantage controller :", error);
    return res.status(500).json({ message: "Erreur lors de la modification de l'avantage", error: error.message });
  }
};

/**
 * Supprimer un avantage
 * @route   DELETE /admin/avantages/:id
 * @access  Admin
 */
const supprimerAvantage = async (req, res) => {
  try {
    const result = await AdminService.supprimerAvantage(req.params.id, req.user.id);

    if (result.message === "Avantage non trouvé") {
      return res.status(404).json({ message: result.message });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Erreur supprimerAvantage controller :", error);
    return res.status(500).json({ message: "Erreur lors de la suppression de l'avantage", error: error.message });
  }
};

// ─────────────────────────────────────────────
// CATÉGORIES
// ─────────────────────────────────────────────

/**
 * Lister toutes les catégories
 * @route   GET /admin/categories
 * @access  Admin
 */
const listeCategories = async (req, res) => {
  try {
    const result = await AdminService.listeCategories();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Erreur listeCategories controller :", error);
    return res.status(500).json({ message: "Erreur lors de la récupération des catégories", error: error.message });
  }
};

/**
 * Ajouter une catégorie
 * @route   POST /admin/categories
 * @access  Admin
 */
const ajouterCategorie = async (req, res) => {
  try {
    const result = await AdminService.ajouterCategorie(req.body, req.user.id);
    return res.status(201).json(result);
  } catch (error) {
    console.error("Erreur ajouterCategorie controller :", error);
    return res.status(500).json({ message: "Erreur lors de l'ajout de la catégorie", error: error.message });
  }
};

/**
 * Modifier une catégorie
 * @route   PUT /admin/categories/:id
 * @access  Admin
 */
const modifierCategorie = async (req, res) => {
  try {
    const result = await AdminService.modifierCategorie(req.params.id, req.body, req.user.id);

    if (!result.categorie) {
      return res.status(404).json({ message: result.message });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Erreur modifierCategorie controller :", error);
    return res.status(500).json({ message: "Erreur lors de la modification de la catégorie", error: error.message });
  }
};

/**
 * Supprimer une catégorie
 * @route   DELETE /admin/categories/:id
 * @access  Admin
 */
const supprimerCategorie = async (req, res) => {
  try {
    const result = await AdminService.supprimerCategorie(req.params.id, req.user.id);

    if (result.message === "Catégorie non trouvée") {
      return res.status(404).json({ message: result.message });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Erreur supprimerCategorie controller :", error);
    return res.status(500).json({ message: "Erreur lors de la suppression de la catégorie", error: error.message });
  }
};

// ─────────────────────────────────────────────
// NIVEAUX
// ─────────────────────────────────────────────

/**
 * Lister tous les niveaux
 * @route   GET /admin/niveaux
 * @access  Admin
 */
const listeNiveau = async (req, res) => {
  try {
    const result = await AdminService.listeNiveau();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Erreur listeNiveau controller :", error);
    return res.status(500).json({ message: "Erreur lors de la récupération des niveaux", error: error.message });
  }
};

/**
 * Ajouter un niveau
 * @route   POST /admin/niveaux
 * @access  Admin
 */
const ajouterNiveau = async (req, res) => {
  try {
    const result = await AdminService.ajouterNiveau(req.body, req.user.id);
    return res.status(201).json(result);
  } catch (error) {
    console.error("Erreur ajouterNiveau controller :", error);
    return res.status(500).json({ message: "Erreur lors de l'ajout du niveau", error: error.message });
  }
};

/**
 * Modifier un niveau
 * @route   PUT /admin/niveaux/:id
 * @access  Admin
 */
const modifierNiveau = async (req, res) => {
  try {
    const result = await AdminService.modifierNiveau(req.params.id, req.body, req.user.id);

    if (!result.niveau) {
      return res.status(404).json({ message: result.message });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Erreur modifierNiveau controller :", error);
    return res.status(500).json({ message: "Erreur lors de la modification du niveau", error: error.message });
  }
};

/**
 * Supprimer un niveau
 * @route   DELETE /admin/niveaux/:id
 * @access  Admin
 */
const supprimerNiveau = async (req, res) => {
  try {
    const result = await AdminService.supprimerNiveau(req.params.id, req.user.id);

    if (result.message === "Niveau non trouvée") {
      return res.status(404).json({ message: result.message });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Erreur supprimerNiveau controller :", error);
    return res.status(500).json({ message: "Erreur lors de la suppression du niveau", error: error.message });
  }
};

/**
 * Statistiques Dashboard
 * @route   GET /admin/dashboard
 * @access  Admin
 */
const getDashboardStats = async (req, res) => {
  try {
    const result = await AdminService.getDashboardStats();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Erreur getDashboardStats controller :", error);
    return res.status(500).json({
      message: "Erreur lors de la récupération des statistiques",
      error: error.message
    });
  }
};

const hello = async (req, res) => {
    return res.status(200).json({
      message:"hello word"
});
  
};

/**
 * Créer un admin
 * @route   POST /admin/admins
 * @access  Admin
 */
const creerAdmin = async (req, res) => {
  try {
    const result = await AdminService.ajoutAdmin(req.body);

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    return res.status(201).json(result);

  } catch (error) {
    console.error("Erreur creerAdmin controller :", error);
    return res.status(500).json({
      message: "Erreur lors de la création de l'admin",
      error: error.message
    });
  }
};

/**
 * Modifier un admin
 * @route   PUT /admin/admins/:id
 * @access  Admin
 */
const modifierAdmin = async (req, res) => {
  try {
    const result = await AdminService.modifierAdmin(req.params.id, req.body);

    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error("Erreur modifierAdmin controller :", error);
    return res.status(500).json({
      message: "Erreur lors de la modification",
      error: error.message
    });
  }
};

/**
 * Désactiver un admin
 * @route   PUT /admin/admins/:id/desactiver
 * @access  Admin
 */
const desactiverAdmin = async (req, res) => {
  try {
    const result = await AdminService.desactiverAdmin(req.params.id);

    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error("Erreur desactiverAdmin controller :", error);
    return res.status(500).json({
      message: "Erreur lors de la désactivation",
      error: error.message
    });
  }
};

/**
 * Activer un admin
 * @route   PUT /admin/admins/:id/activer
 * @access  Admin
 */
const activerAdmin = async (req, res) => {
  try {
    const result = await AdminService.activerAdmin(req.params.id);

    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error("Erreur activerAdmin controller :", error);
    return res.status(500).json({
      message: "Erreur lors de l'activation",
      error: error.message
    });
  }
};

/**
 * Lister tous les admins
 * @route   GET /admin/admins
 * @access  Admin
 */
const listeAdmins = async (req, res) => {
  try {
    const result = await AdminService.listeAdmins();
    return res.status(200).json(result);

  } catch (error) {
    console.error("Erreur listeAdmins controller :", error);
    return res.status(500).json({
      message: "Erreur récupération admins",
      error: error.message
    });
  }
};

/**
 * Lister toutes les permissions
 * @route   GET /admin/permissions
 * @access  Admin
 */
const listePermissions = async (req, res) => {
  try {
    const result = await AdminService.listePermissions();
    return res.status(200).json(result);

  } catch (error) {
    console.error("Erreur listePermissions controller :", error);
    return res.status(500).json({
      message: "Erreur récupération permissions",
      error: error.message
    });
  }
};

/**
 * Ajouter une permission
 * @route   POST /admin/permissions
 * @access  Admin
 */
const ajouterPermission = async (req, res) => {
  try {
    const result = await AdminService.ajouterPermission(req.body);

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    return res.status(201).json(result);

  } catch (error) {
    console.error("Erreur ajouterPermission controller :", error);
    return res.status(500).json({
      message: "Erreur ajout permission",
      error: error.message
    });
  }
};

/**
 * Modifier une permission
 * @route   PUT /admin/permissions/:id
 * @access  Admin
 */
const modifierPermission = async (req, res) => {
  try {
    const result = await AdminService.modifierPermission(req.params.id, req.body);

    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error("Erreur modifierPermission controller :", error);
    return res.status(500).json({
      message: "Erreur modification permission",
      error: error.message
    });
  }
};

/**
 * Supprimer une permission
 * @route   DELETE /admin/permissions/:id
 * @access  Admin
 */
const supprimerPermission = async (req, res) => {
  try {
    const result = await AdminService.supprimerPermission(req.params.id);

    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error("Erreur supprimerPermission controller :", error);
    return res.status(500).json({
      message: "Erreur suppression permission",
      error: error.message
    });
  }
};

// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────
module.exports = {
  // Utilisateurs
  activerUtilisateur,
  desactiverUtilisateur,
  // Produits
  listerProduit,
  ajouterProduit,
  modifierProduit,
  supprimerProduit,
  // Commandes
  listeCommandes,
  validerCommande,
  rejeterCommande,
  livrerCommande,
  // Pharmacies
  listePharmacies,
  listePharmaciesEnAttente,
  validerInscriptionPharmacies,
  rejeterInscriptionPharmacies,
  // Avantages
  listeAvantages,
  ajouterAvantage,
  modifierAvantage,
  supprimerAvantage,
  // Catégories
  listeCategories,
  ajouterCategorie,
  modifierCategorie,
  supprimerCategorie,
  // Niveaux
  listeNiveau,
  ajouterNiveau,
  modifierNiveau,
  supprimerNiveau,

  getDashboardStats,
  hello,

  // Admins
  creerAdmin,
  modifierAdmin,
  desactiverAdmin,
  activerAdmin,
  listeAdmins,

  // Permissions
  listePermissions,
  ajouterPermission,
  modifierPermission,
  supprimerPermission,
};
const PharmacieService = require('../../services/pharmacie/pharmacie.service');

// ===================== PRODUITS =====================

// 🔹 GET /produits
exports.listerProduits = async (req, res) => {
  try {
    const produits = await PharmacieService.listerProduitsActif();
    res.status(200).json(produits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 GET /produits/:id
exports.getProduit = async (req, res) => {
  try {
    const produit = await PharmacieService.getProduitById(req.params.id);
    res.status(200).json(produit);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// 🔹 GET /produits/recherche?query=xxx
exports.rechercherProduits = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Query manquante" });
    }

    const result = await PharmacieService.rechercherProduits(query);
    res.status(200).json(result);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===================== COMMANDES =====================

// 🔹 POST /commandes
exports.commander = async (req, res) => {
  try {
    const { produits } = req.body;

    if (!produits || !produits.length) {
      return res.status(400).json({ message: "Aucun produit fourni" });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    const commande = await PharmacieService.commanderProduits(
      req.user.id,
      produits
    );

    res.status(201).json(commande);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ===================== MES COMMANDES =====================

exports.commandesLivrees = async (req, res) => {
  try {
    const data = await PharmacieService.mesCommandesLivree(req.user.id);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//nombre de commande livree

exports.nombreCommandeLivree = async (req, res) => {
  try {
    const data = await PharmacieService.nombreCommandeLivree(req.user.id);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 GET /mes-commandes/en-attente
exports.commandesEnAttente = async (req, res) => {
  try {
    const data = await PharmacieService.mesCommandesEnAttente(req.user.id);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//nombre de commande en attente

exports.nombreCommandeEnAttente = async (req, res) => {
  try {
    const data = await PharmacieService.nombreCommandeEnAttente(req.user.id);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 GET /mes-commandes/annulees
exports.commandesAnnulees = async (req, res) => {
  try {
    const data = await PharmacieService.mesCommandesAnnulees(req.user.id);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//nombre de commande annulee

exports.nombreCommandeAnnulee = async (req, res) => {
  try {
    const data = await PharmacieService.nombreCommandeAnnulee(req.user.id);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 GET /mes-commandes/validees
exports.commandesValidees = async (req, res) => {
  try {
    const data = await PharmacieService.mesCommandesValidees(req.user.id);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//nombre de commande valider

exports.nombreCommandeValidees = async (req, res) => {
  try {
    const data = await PharmacieService.nombreCommandeValidees(req.user.id);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 GET /mes-commandes/rejetees
exports.commandesRejetees = async (req, res) => {
  try {
    const data = await PharmacieService.mesCommandesRejetees(req.user.id);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//nombre de commande rejeter

exports.nombreCommandeRejetees = async (req, res) => {
  try {
    const data = await PharmacieService.nombreCommandeRejetees(req.user.id);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// nombre total de commande

exports.nombreTotalDeCommandes = async (req, res) => {
  try {
    const data = await PharmacieService.nombreTotalDeCommandes(req.user.id);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===================== DETAIL COMMANDE =====================

// 🔹 GET /commandes/:id
exports.detailCommande = async (req, res) => {
  try {
    const commande = await PharmacieService.detailCommande(req.params.id);
    res.status(200).json(commande);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// ===================== ANNULATION =====================

// 🔹 PATCH /commandes/:id/annuler
exports.annulerCommande = async (req, res) => {
  try {
    const commande = await PharmacieService.annulerCommande(req.params.id);
    res.status(200).json(commande);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
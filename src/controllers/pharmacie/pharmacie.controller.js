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

    const pharmacie = await Pharmacie.findOne({
      where: { pharmacienId: req.user.id }
    });

    if (!pharmacie) {
      return res.status(404).json({
        message: "Pharmacie introuvable"
      });
    }

    const commande = await PharmacieService.commanderProduits(
      req.user.id,
      pharmacie.id,
      produits
    );

    res.status(201).json(commande);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ===================== MES COMMANDES =====================

// 🔹 GET /mes-commandes/livrees
exports.commandesLivrees = async (req, res) => {
  try {
    const data = await PharmacieService.mesCommandesLivree(req.user.id);
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

// 🔹 GET /mes-commandes/annulees
exports.commandesAnnulees = async (req, res) => {
  try {
    const data = await PharmacieService.mesCommandesAnnulees(req.user.id);
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

// 🔹 GET /mes-commandes/rejetees
exports.commandesRejetees = async (req, res) => {
  try {
    const data = await PharmacieService.mesCommandesRejetees(req.user.id);
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
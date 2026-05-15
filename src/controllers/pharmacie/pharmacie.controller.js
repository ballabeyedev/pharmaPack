const PharmacieService = require('../../services/pharmacie/pharmacie.service');

/* ═══════════════════════════════════════════════════════
   WRAPPER GÉNÉRIQUE
═══════════════════════════════════════════════════════ */
const handle = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (error) {
    console.error(`[PharmacieController] ${fn.name} :`, error.message);
    return res.status(500).json({
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

/* ─── Helpers réponse ─── */
const ok = (res, data, status = 200) => res.status(status).json(data);
const created = (res, data) => res.status(201).json(data);
const notFound = (res, message) => res.status(404).json({ message });


// ===================== PRODUITS =====================
exports.listerProduits = handle(async (req, res) => {
  const result = await PharmacieService.listerProduitsActif();
  return ok(res, result);
});

exports.getProduit = handle(async (req, res) => {
  const result = await PharmacieService.getProduitById(req.params.id);

  if (!result.produit) return notFound(res, result.message);

  return ok(res, result);
});

exports.rechercherProduits = handle(async (req, res) => {
  const { query } = req.query;

  if (!query) return notFound(res, "Query manquante");

  const result = await PharmacieService.rechercherProduits(query);
  return ok(res, result);
});

// ===================== COMMANDES =====================

exports.commander = handle(async (req, res) => {
  const { produits } = req.body;

  if (!produits?.length)
    return notFound(res, "Aucun produit fourni");

  const result = await PharmacieService.commanderProduits(
    req.user.id,
    produits
  );

  if (!result.success) return notFound(res, result.message);

  return created(res, result);
});

// ===================== MES COMMANDES =====================

exports.commandesLivrees = handle(async (req, res) => {
  const result = await PharmacieService.mesCommandesLivree(req.user.id);
  return ok(res, result);
});

exports.nombreCommandeLivree = handle(async (req, res) => {
  const result = await PharmacieService.nombreCommandeLivree(req.user.id);
  return ok(res, result);
});

exports.commandesEnAttente = handle(async (req, res) => {
  const result = await PharmacieService.mesCommandesEnAttente(req.user.id);
  return ok(res, result);
});

//nombre de commande en attente

exports.nombreCommandeEnAttente = handle(async (req, res) => {
  const result = await PharmacieService.nombreCommandeEnAttente(req.user.id);
  return ok(res, result);
});

exports.commandesAnnulees = handle(async (req, res) => {
  const result = await PharmacieService.mesCommandesAnnulees(req.user.id);
  return ok(res, result);
});

//nombre de commande annulee

exports.nombreCommandeAnnulee = handle(async (req, res) => {
  const result = await PharmacieService.nombreCommandeAnnulee(req.user.id);
  return ok(res, result);
});

// 🔹 GET /mes-commandes/validees
exports.commandesValidees = handle(async (req, res) => {
  const result = await PharmacieService.mesCommandesValidees(req.user.id);
  return ok(res, result);
});

//nombre de commande valider

exports.nombreCommandeValidees = handle(async (req, res) => {
  const result = await PharmacieService.nombreCommandeValidees(req.user.id);
  return ok(res, result);
});

exports.commandesRejetees = handle(async (req, res) => {
  const result = await PharmacieService.mesCommandesRejetees(req.user.id);
  return ok(res, result);
});

//nombre de commande rejeter

exports.nombreCommandeRejetees = handle(async (req, res) => {
  const result = await PharmacieService.nombreCommandeRejetees(req.user.id);
  return ok(res, result);
});

// nombre total de commande

exports.nombreTotalDeCommandes = handle(async (req, res) => {
  const result = await PharmacieService.nombreTotalDeCommandes(req.user.id);
  return ok(res, result);
});

// ===================== DETAIL COMMANDE =====================

exports.detailCommande = handle(async (req, res) => {
  const result = await PharmacieService.detailCommande(
    req.params.id,
    req.user.id
  );
  return ok(res, result);
});

// ===================== ANNULATION =====================

exports.annulerCommande = handle(async (req, res) => {
  const { motifAnnulation } = req.body;

  if (!motifAnnulation) return notFound(res, "Motif d'annulation est requis");

  const result = await PharmacieService.annulerCommande(
    req.params.id,
    req.user.id,
    motifAnnulation
  );
  return ok(res, result);
});

//historique des 10 derniers commandes
exports.historiqueCommandes = handle(async (req, res) => {
  const result = await PharmacieService.historiqueCommandes(req.user.id);
  return ok(res, result);
});

//historique des commandes
exports.allCommandes = handle(async (req, res) => {
  const result = await PharmacieService.allCommandes(req.user.id);
  return ok(res, result);
});
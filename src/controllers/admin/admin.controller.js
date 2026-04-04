// controllers/admin/admin.controller.js
const AdminService = require('../../services/admin/admin.service');
const formatUser   = require('../../utils/formatUser');
const { uploadImage } = require('../../middlewares/uploadService');

/* ═══════════════════════════════════════════════════════
   WRAPPER GÉNÉRIQUE
   Élimine les blocs try/catch répétitifs sur chaque route
═══════════════════════════════════════════════════════ */
const handle = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (error) {
    console.error(`[AdminController] ${fn.name} :`, error.message);
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

/* ─── Réponse 404 standard ─── */
const notFound = (res, message) => res.status(404).json({ message });

/* ─── Réponse succès standard ─── */
const ok     = (res, data, status = 200) => res.status(status).json(data);
const created = (res, data)              => res.status(201).json(data);

/* ═══════════════════════════════════════════════════════
   UTILISATEURS
═══════════════════════════════════════════════════════ */
const activerUtilisateur = handle(async (req, res) => {
  const result = await AdminService.activerUtilisateur(req.params.id);
  if (!result.utilisateur) return notFound(res, result.message);
  return ok(res, { message: result.message, utilisateur: formatUser(result.utilisateur) });
});

const desactiverUtilisateur = handle(async (req, res) => {
  const result = await AdminService.desactiverUtilisateur(req.params.id);
  if (!result.utilisateur) return notFound(res, result.message);
  return ok(res, { message: result.message, utilisateur: formatUser(result.utilisateur) });
});

/* ═══════════════════════════════════════════════════════
   PRODUITS
═══════════════════════════════════════════════════════ */
const listerProduit = handle(async (req, res) => {
  return ok(res, await AdminService.listerProduit());
});

const ajouterProduit = handle(async (req, res) => {
  const imageUrl = req.file ? await uploadImage(req.file.buffer) : null;
  const result   = await AdminService.ajouterProduit({ ...req.body, image: imageUrl }, req.user.id);
  return created(res, result);
});

const modifierProduit = handle(async (req, res) => {
  const result = await AdminService.modifierProduit(req.params.id, req.body, req.user.id);
  if (!result.produit) return notFound(res, result.message);
  return ok(res, result);
});

const supprimerProduit = handle(async (req, res) => {
  const result = await AdminService.supprimerProduit(req.params.id, req.user.id);
  if (result.message === 'Produit non trouvé') return notFound(res, result.message);
  return ok(res, result);
});

/* ═══════════════════════════════════════════════════════
   COMMANDES
═══════════════════════════════════════════════════════ */
const listeCommandes = handle(async (req, res) => {
  return ok(res, await AdminService.listeCommandes());
});

const validerCommande = handle(async (req, res) => {
  const result = await AdminService.validerCommande(req.params.id, req.user.id);
  if (!result.commande) return notFound(res, result.message);
  return ok(res, result);
});

const rejeterCommande = handle(async (req, res) => {
  const result = await AdminService.rejeterCommande(req.params.id, req.user.id);
  if (!result.commande) return notFound(res, result.message);
  return ok(res, result);
});

const livrerCommande = handle(async (req, res) => {
  const result = await AdminService.livrerCommande(req.params.id, req.user.id);
  if (!result.commande) return notFound(res, result.message);
  return ok(res, result);
});

/* ═══════════════════════════════════════════════════════
   PHARMACIES
═══════════════════════════════════════════════════════ */
const listePharmacies = handle(async (req, res) => {
  return ok(res, await AdminService.listePharmacies());
});

const listePharmaciesEnAttente = handle(async (req, res) => {
  return ok(res, await AdminService.listePharmaciesEnAttente());
});

const validerInscriptionPharmacies = handle(async (req, res) => {
  const result = await AdminService.validerInscriptionPharmacies(req.params.id, req.user.id);
  if (!result.utilisateur) return notFound(res, result.message);
  return ok(res, result);
});

const rejeterInscriptionPharmacies = handle(async (req, res) => {
  const result = await AdminService.rejeterInscriptionPharmacies(req.params.id, req.user.id);
  if (!result.utilisateur) return notFound(res, result.message);
  return ok(res, result);
});

/* ═══════════════════════════════════════════════════════
   AVANTAGES
═══════════════════════════════════════════════════════ */
const listeAvantages = handle(async (req, res) => {
  return ok(res, await AdminService.listeAvantages());
});

const ajouterAvantage = handle(async (req, res) => {
  const { pharmacieId, type, montant } = req.body;
  return created(res, await AdminService.ajouterAvantage(pharmacieId, type, montant, req.user.id));
});

const modifierAvantage = handle(async (req, res) => {
  const result = await AdminService.modifierAvantage(req.params.id, req.body, req.user.id);
  if (!result.avantage) return notFound(res, result.message);
  return ok(res, result);
});

const supprimerAvantage = handle(async (req, res) => {
  const result = await AdminService.supprimerAvantage(req.params.id, req.user.id);
  if (result.message === 'Avantage non trouvé') return notFound(res, result.message);
  return ok(res, result);
});

/* ═══════════════════════════════════════════════════════
   CATÉGORIES
═══════════════════════════════════════════════════════ */
const listeCategories = handle(async (req, res) => {
  return ok(res, await AdminService.listeCategories());
});

const ajouterCategorie = handle(async (req, res) => {
  return created(res, await AdminService.ajouterCategorie(req.body, req.user.id));
});

const modifierCategorie = handle(async (req, res) => {
  const result = await AdminService.modifierCategorie(req.params.id, req.body, req.user.id);
  if (!result.categorie) return notFound(res, result.message);
  return ok(res, result);
});

const supprimerCategorie = handle(async (req, res) => {
  const result = await AdminService.supprimerCategorie(req.params.id, req.user.id);
  if (result.message === 'Catégorie non trouvée') return notFound(res, result.message);
  return ok(res, result);
});

/* ═══════════════════════════════════════════════════════
   NIVEAUX
═══════════════════════════════════════════════════════ */
const listeNiveau = handle(async (req, res) => {
  return ok(res, await AdminService.listeNiveau());
});

const ajouterNiveau = handle(async (req, res) => {
  return created(res, await AdminService.ajouterNiveau(req.body, req.user.id));
});

const modifierNiveau = handle(async (req, res) => {
  const result = await AdminService.modifierNiveau(req.params.id, req.body, req.user.id);
  if (!result.niveau) return notFound(res, result.message);
  return ok(res, result);
});

const supprimerNiveau = handle(async (req, res) => {
  const result = await AdminService.supprimerNiveau(req.params.id, req.user.id);
  if (result.message === 'Niveau non trouvée') return notFound(res, result.message);
  return ok(res, result);
});

/* ═══════════════════════════════════════════════════════
   ADMINS
═══════════════════════════════════════════════════════ */
const listeAdmins = handle(async (req, res) => {
  return ok(res, await AdminService.listeAdmins());
});

const creerAdmin = handle(async (req, res) => {
  const result = await AdminService.ajoutAdmin(req.body);
  if (!result.success) return res.status(400).json({ message: result.message });
  return created(res, result);
});

const modifierAdmin = handle(async (req, res) => {
  const result = await AdminService.modifierAdmin(req.params.id, req.body);
  if (!result.success) return notFound(res, result.message);
  return ok(res, result);
});

const desactiverAdmin = handle(async (req, res) => {
  const result = await AdminService.desactiverAdmin(req.params.id);
  if (!result.success) return notFound(res, result.message);
  return ok(res, result);
});

const activerAdmin = handle(async (req, res) => {
  const result = await AdminService.activerAdmin(req.params.id);
  if (!result.success) return notFound(res, result.message);
  return ok(res, result);
});

/* ═══════════════════════════════════════════════════════
   PERMISSIONS
═══════════════════════════════════════════════════════ */
const listePermissions = handle(async (req, res) => {
  return ok(res, await AdminService.listePermissions());
});

const ajouterPermission = handle(async (req, res) => {
  const result = await AdminService.ajouterPermission(req.body);
  if (!result.success) return res.status(400).json({ message: result.message });
  return created(res, result);
});

const modifierPermission = handle(async (req, res) => {
  const result = await AdminService.modifierPermission(req.params.id, req.body);
  if (!result.success) return notFound(res, result.message);
  return ok(res, result);
});

const supprimerPermission = handle(async (req, res) => {
  const result = await AdminService.supprimerPermission(req.params.id);
  if (!result.success) return notFound(res, result.message);
  return ok(res, result);
});

/* ═══════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════ */
const getDashboardStats = handle(async (req, res) => {
  return ok(res, await AdminService.getDashboardStats());
});

const hello = handle(async (req, res) => {
  return ok(res, { message: 'hello world' });
});

/* ═══════════════════════════════════════════════════════
   EXPORTS
═══════════════════════════════════════════════════════ */
module.exports = {
  // Utilisateurs
  activerUtilisateur, desactiverUtilisateur,
  // Produits
  listerProduit, ajouterProduit, modifierProduit, supprimerProduit,
  // Commandes
  listeCommandes, validerCommande, rejeterCommande, livrerCommande,
  // Pharmacies
  listePharmacies, listePharmaciesEnAttente,
  validerInscriptionPharmacies, rejeterInscriptionPharmacies,
  // Avantages
  listeAvantages, ajouterAvantage, modifierAvantage, supprimerAvantage,
  // Catégories
  listeCategories, ajouterCategorie, modifierCategorie, supprimerCategorie,
  // Niveaux
  listeNiveau, ajouterNiveau, modifierNiveau, supprimerNiveau,
  // Admins
  listeAdmins, creerAdmin, modifierAdmin, desactiverAdmin, activerAdmin,
  // Permissions
  listePermissions, ajouterPermission, modifierPermission, supprimerPermission,
  // Divers
  getDashboardStats, hello,
};
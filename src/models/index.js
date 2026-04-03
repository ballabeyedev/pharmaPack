const User = require('./utilisateur.model');
const Pharmacie = require('./pharmacie.model');
const Categorie = require('./categorie.model');
const Produit = require('./produit.model');
const Commande = require('./commande.model');
const CommandeDetails = require('./commandeDetail.model');
const Avantage = require('./avantage.model');
const PortefeuilleFidelite = require('./portefeuilleFidelite.model');
const TransactionFidelite = require('./transactionFidelite.model');
const Conversion = require('./conversion.model');
const Niveau = require('./niveau.model');
const Promotion = require('./promotion.model');
const Permission = require('./permission.model');


/* ===================== RELATIONS UTILISATEUR ===================== */
// Un utilisateur peut gérer plusieurs pharmacies (si rôle = pharmacie)
User.hasMany(Pharmacie, { 
  foreignKey: 'pharmacienId', 
  as: 'pharmacies' 
});
Pharmacie.belongsTo(User, { 
  foreignKey: 'pharmacienId', 
  as: 'pharmacien' 
});

// Un utilisateur peut créer plusieurs produits
// Associations
User.hasMany(Produit, { 
  foreignKey: 'created_by', 
  as: 'produits_crees' 
});
Produit.belongsTo(User, { 
  foreignKey: 'created_by', 
  as: 'createur'  // <-- ici, alias différent du nom de colonne
});

Produit.belongsTo(User, { 
  foreignKey: 'updated_by', 
  as: 'modificateur'  // <-- idem
});

// Un utilisateur peut créer plusieurs commandes
User.hasMany(Commande, { 
  foreignKey: 'created_by', 
  as: 'commandes' 
});
Commande.belongsTo(User, { 
  foreignKey: 'created_by', 
  as: 'createur' 
});

/* ===================== RELATIONS PHARMACIE ===================== */
// Une pharmacie peut avoir plusieurs commandes
Pharmacie.hasMany(Commande, { 
  foreignKey: 'pharmacie_id', 
  as: 'commandes' 
});
Commande.belongsTo(Pharmacie, { 
  foreignKey: 'pharmacie_id', 
  as: 'pharmacie' 
});

// Une pharmacie peut proposer plusieurs produits
Pharmacie.hasMany(Produit, { 
  foreignKey: 'pharmacienId', 
  as: 'produits' 
});
Produit.belongsTo(Pharmacie, { 
  foreignKey: 'pharmacienId', 
  as: 'pharmacie' 
});

// Une pharmacie peut avoir plusieurs avantages
Pharmacie.hasMany(Avantage, { 
  foreignKey: 'pharmacie_id', 
  as: 'avantages' 
});
Avantage.belongsTo(Pharmacie, { 
  foreignKey: 'pharmacie_id', 
  as: 'pharmacie' 
});

// Une pharmacie a un portefeuille fidélité
Pharmacie.hasOne(PortefeuilleFidelite, { 
  foreignKey: 'pharmacie_id', 
  as: 'portefeuille' 
});
PortefeuilleFidelite.belongsTo(Pharmacie, { 
  foreignKey: 'pharmacie_id', 
  as: 'pharmacie' 
});

// Une pharmacie peut avoir plusieurs transactions fidélité
Pharmacie.hasMany(TransactionFidelite, { 
  foreignKey: 'pharmacie_id', 
  as: 'transactions' 
});
TransactionFidelite.belongsTo(Pharmacie, { 
  foreignKey: 'pharmacie_id', 
  as: 'pharmacie' 
});

// Une pharmacie peut avoir plusieurs conversions d’avantages
Pharmacie.hasMany(Conversion, { 
  foreignKey: 'pharmacie_id', 
  as: 'conversions' 
});
Conversion.belongsTo(Pharmacie, { 
  foreignKey: 'pharmacie_id', 
  as: 'pharmacie' 
});

/* ===================== RELATIONS CATEGORIE ===================== */
// Une catégorie peut avoir plusieurs produits
Categorie.hasMany(Produit, { 
  foreignKey: 'categorie_id', 
  as: 'produits' 
});
Produit.belongsTo(Categorie, { 
  foreignKey: 'categorie_id', 
  as: 'categorie' 
});

/* ===================== RELATIONS COMMANDE ===================== */
// Une commande peut avoir plusieurs détails
Commande.hasMany(CommandeDetails, { 
  foreignKey: 'commande_id', 
  as: 'details' 
});
CommandeDetails.belongsTo(Commande, { 
  foreignKey: 'commande_id', 
  as: 'commande' 
});

// Chaque détail correspond à un produit
Produit.hasMany(CommandeDetails, { 
  foreignKey: 'produit_id', 
  as: 'commande_details' 
});
CommandeDetails.belongsTo(Produit, { 
  foreignKey: 'produit_id', 
  as: 'produit' 
});

/* ===================== RELATIONS PROMOTION ===================== */
// Une promotion peut être appliquée à un produit
Produit.hasMany(Promotion, { 
  foreignKey: 'produit_id', 
  as: 'promotions' 
});
Promotion.belongsTo(Produit, { 
  foreignKey: 'produit_id', 
  as: 'produit' 
});

/* ===================== RELATIONS NIVEAUX ===================== */
// Niveau peut être utilisé pour d’autres logiques (ex : portefeuille ou gamification)
// Si tu veux lier les pharmacies aux niveaux selon leur CA :
Niveau.hasMany(PortefeuilleFidelite, {
  foreignKey: 'niveau_id',
  as: 'portefeuilles'
});
PortefeuilleFidelite.belongsTo(Niveau, {
  foreignKey: 'niveau_id',
  as: 'niveau'
});

User.belongsToMany(Permission, {
  through: 'user_permissions',
  foreignKey: 'user_id',
  otherKey: 'permission_id',
  as: 'permissions'
});

Permission.belongsToMany(User, {
  through: 'user_permissions',
  foreignKey: 'permission_id',
  otherKey: 'user_id',
  as: 'users'
});

module.exports = {
  User,
  Pharmacie,
  Categorie,
  Produit,
  Commande,
  CommandeDetails,
  Avantage,
  PortefeuilleFidelite,
  TransactionFidelite,
  Conversion,
  Niveau,
  Promotion,
  Permission
};
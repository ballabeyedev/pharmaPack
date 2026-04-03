const { User, Pharmacie, Produit, Commande, CommandeDetails, Avantage, Conversion, Categorie, Niveau, Permission } = require('../../models');

const { Op } = require('sequelize');

class AdminService {

  static async activerUtilisateur(utilisateurId) {
    try {
      const utilisateur = await User.findByPk(utilisateurId);

      if (!utilisateur) {
        return { message: "Utilisateur non trouvé" };
      }

      // Mettre à jour le statut
      utilisateur.statut = 'actif';
      await utilisateur.save();

      return {
        message: "Utilisateur activé avec succès",
        utilisateur: {
          id: utilisateur.id,
          nom: utilisateur.nom,
          prenom: utilisateur.prenom,
          email: utilisateur.email,
          statut: utilisateur.statut,
          role: utilisateur.role
        }
      };

    } catch (error) {
      console.error("Erreur activerUtilisateur :", error);
      throw error;
    }
  }

  static async desactiverUtilisateur(utilisateurId) {
    try {
      const utilisateur = await User.findByPk(utilisateurId);

      if (!utilisateur) {
        return { message: "Utilisateur non trouvé" };
      }

      // Mettre à jour le statut
      utilisateur.statut = 'inactif';
      await utilisateur.save();

      return {
        message: "Utilisateur desactivé avec succès",
        utilisateur: {
          id: utilisateur.id,
          nom: utilisateur.nom,
          prenom: utilisateur.prenom,
          email: utilisateur.email,
          statut: utilisateur.statut,
          role: utilisateur.role
        }
      };

    } catch (error) {
      console.error("Erreur desactiverUtilisateur :", error);
      throw error;
    }
  }

  static async listerProduit() {
    try {
      const produits = await Produit.findAll({
        include: [
          {
            model: Categorie,
            as: 'categorie',
            attributes: ['id', 'nom'] 
          }
        ],
        order: [['created_at', 'DESC']]
      });

      return {
        message: "Liste des produits",
        produits
      };

    } catch (error) {
      console.error("Erreur listerProduit :", error);
      throw error;
    }
  }

 static async ajouterProduit(data, userId) {
    try {
      if (!data.nom || !data.prix) {
        return res.status(400).json({
          message: "Nom et prix sont obligatoires"
        });
      }
      const produit = await Produit.create({
        ...data, 
        prix: Number(data.prix),
        prix_promo: data.prix_promo ? Number(data.prix_promo) : null,
        stock: data.stock ? Number(data.stock) : 0,
        categorie_id: data.categorie_id || null,
        created_by: userId 
      });
      return { message: "Produit ajouté", produit };
    } catch (error) {
      console.error("Erreur ajouterProduit :", error);
      throw error;
    }
  }

  static async modifierProduit(produitId, data, userId) {
    try {
      const produit = await Produit.findByPk(produitId);
      if (!produit) return { message: "Produit non trouvé" };
      await produit.update({ ...data, updated_by: userId});
      return { message: "Produit modifié", produit };
    } catch (error) {
      console.error("Erreur modifierProduit :", error);
      throw error;
    }
  }

  static async supprimerProduit(produitId, userId) {
    try {
      const produit = await Produit.findByPk(produitId);
      if (!produit) return { message: "Produit non trouvé" };
      await produit.destroy({deleted_by: userId});
      return { message: "Produit supprimé avec succès" };
    } catch (error) {
      console.error("Erreur supprimerProduit :", error);
      throw error;
    }
  }

  static async listeCommandes() {
    try {
      const commandes = await Commande.findAll({
        include: [
          { model: Pharmacie, as: 'pharmacie' },
          { model: CommandeDetails, as: 'details', include: ['produit'] }
        ]
      });
      return { message: "Liste des commandes", commandes };
    } catch (error) {
      console.error("Erreur listeCommandes :", error);
      throw error;
    }
  }

  static async validerCommande(commandeId, userId) {
    try {
      const commande = await Commande.findByPk(commandeId);
      if (!commande) return { message: "Commande non trouvée" };
      commande.statut = 'en_preparation';
      await commande.save({updated_by: userId});
      return { message: "Commande validée", commande };
    } catch (error) {
      console.error("Erreur validerCommande :", error);
      throw error;
    }
  }

  static async rejeterCommande(commandeId, userId) {
    try {
      const commande = await Commande.findByPk(commandeId);
      if (!commande) return { message: "Commande non trouvée" };
      commande.statut = 'annulee';
      await commande.save({updated_by: userId});
      return { message: "Commande rejetée", commande };
    } catch (error) {
      console.error("Erreur rejeterCommande :", error);
      throw error;
    }
  }

  static async livrerCommande(commandeId, userId) {
    try {
      const commande = await Commande.findByPk(commandeId);
      if (!commande) return { message: "Commande non trouvée" };
      commande.statut = 'livree';
      await commande.save({updated_by: userId});
      return { message: "Commande livrée", commande };
    } catch (error) {
      console.error("Erreur livrerCommande :", error);
      throw error;
    }
  }

  static async listePharmacies() {
    try {
      const pharmacies = await Pharmacie.findAll({
        include: [
          { 
            model: User, 
            as: 'pharmacien',  
            where: {
              statut: { [Op.ne]: 'en_attente' } 
            },
            attributes: ['id', 'nom', 'prenom', 'email', 'statut', 'role', 'telephone']
          }
        ]
      });

      return { message: "Liste des pharmacies (utilisateurs actifs ou inactifs)", pharmacies };
    } catch (error) {
      console.error("Erreur listePharmacies :", error);
      throw error;
    }
  }

  static async listePharmaciesEnAttente() {
    try {
      const pharmacies = await Pharmacie.findAll({
        include: [
          {
            model: User,
            as: 'pharmacien',
            where: { statut: 'en_attente' }, 
            attributes: ['id', 'nom', 'prenom', 'email', 'statut', 'role', 'telephone']
          }
        ]
      });

      return {
        message: "Liste des pharmacies en attente",
        pharmacies
      };
    } catch (error) {
      console.error("Erreur listePharmaciesEnAttente :", error);
      throw error;
    }
  }

  static async validerInscriptionPharmacies(pharmacieId, userId) {
    try {
      const pharmacie = await Pharmacie.findByPk(pharmacieId);
      if (!pharmacie) return { message: "Pharmacie non trouvée" };

      // Récupérer l'utilisateur lié à la pharmacie
      const utilisateur = await User.findByPk(pharmacie.pharmacienId);
      if (!utilisateur) return { message: "Utilisateur de la pharmacie non trouvé" };

      // Mettre à jour le statut de l'utilisateur
      utilisateur.statut = 'actif';
      utilisateur.updated_by = userId;
      await utilisateur.save();

      return { message: "Inscription de la pharmacie validée", utilisateur };
    } catch (error) {
      console.error("Erreur validerInscriptionPharmacies :", error);
      throw error;
    }
  }

  static async rejeterInscriptionPharmacies(pharmacieId, userId) {
    try {
      const pharmacie = await Pharmacie.findByPk(pharmacieId);
      if (!pharmacie) return { message: "Pharmacie non trouvée" };

      // Récupérer l'utilisateur lié à la pharmacie
      const utilisateur = await User.findByPk(pharmacie.pharmacienId);
      if (!utilisateur) return { message: "Utilisateur de la pharmacie non trouvé" };

      // Mettre à jour le statut de l'utilisateur
      utilisateur.statut = 'inactif';
      utilisateur.updated_by = userId;
      await utilisateur.save();

      return { message: "Inscription de la pharmacie rejetée", utilisateur };
    } catch (error) {
      console.error("Erreur rejeterInscriptionPharmacies :", error);
      throw error;
    }
  }

  static async ajouterAvantage(pharmacieId, type, montant, createdBy) {
    try {
      const avantage = await Avantage.create({
        pharmacie_id: pharmacieId,
        type,
        montant,
        created_by: createdBy
      });
      return { message: "Avantage ajouté", avantage };
    } catch (error) {
      console.error("Erreur ajouterAvantage :", error);
      throw error;
    }
  }
  static async modifierAvantage(avantageId, data, updatedBy) {
    try {
      const avantage = await Avantage.findByPk(avantageId);
      if (!avantage) return { message: "Avantage non trouvé" };

      await avantage.update({ ...data, updated_by: updatedBy });
      return { message: "Avantage modifié", avantage };
    } catch (error) {
      console.error("Erreur modifierAvantage :", error);
      throw error;
    }
  }
  static async supprimerAvantage(avantageId, deletedBy) {
    try {
      const avantage = await Avantage.findByPk(avantageId);
      if (!avantage) return { message: "Avantage non trouvé" };

      // Mettre à jour deleted_by avant suppression
      await avantage.update({ deleted_by: deletedBy });

      // Soft delete
      await avantage.destroy();

      return { message: "Avantage supprimé avec succès", id: avantageId };
    } catch (error) {
      console.error("Erreur supprimerAvantage :", error);
      throw error;
    }
  }

  static async listeAvantages() {
    try {
      // Récupérer tous les avantages non supprimés
      const avantages = await Avantage.findAll({
        include: [{ model: Pharmacie, as: 'pharmacie' }],
        order: [['created_at', 'DESC']]
      });

      return { message: "Liste des avantages", avantages };
    } catch (error) {
      console.error("Erreur listeAvantages :", error);
      throw error;
    }
  }

  // Ajouter une catégorie
  static async ajouterCategorie(data, userId) {
    try {
      const categorie = await Categorie.create({ ...data, created_by: userId });
      return { message: "Catégorie ajoutée avec succès", categorie };
    } catch (error) {
      console.error("Erreur ajouterCategorie :", error);
      throw error;
    }
  }

  // Modifier une catégorie
  static async modifierCategorie(categorieId, data, userId) {
    try {
      const categorie = await Categorie.findByPk(categorieId);
      if (!categorie) return { message: "Catégorie non trouvée" };

      await categorie.update({ ...data, updated_by: userId });
      return { message: "Catégorie modifiée avec succès", categorie };
    } catch (error) {
      console.error("Erreur modifierCategorie :", error);
      throw error;
    }
  }

  // Supprimer une catégorie (soft delete)
  static async supprimerCategorie(categorieId, userId) {
    try {
      const categorie = await Categorie.findByPk(categorieId);
      if (!categorie) return { message: "Catégorie non trouvée" };

      await categorie.destroy({ deleted_by: userId }); // soft delete car paranoid: true
      return { message: "Catégorie supprimée avec succès" };
    } catch (error) {
      console.error("Erreur supprimerCategorie :", error);
      throw error;
    }
  }

  // Lister toutes les catégories non supprimées
  static async listeCategories() {
    try {
      const categories = await Categorie.findAll({
        order: [['created_at', 'DESC']]
      });
      return { message: "Liste des catégories", categories };
    } catch (error) {
      console.error("Erreur listeCategories :", error);
      throw error;
    }
  }

  // Ajouter une niveau
  static async ajouterNiveau(data, userId) {
    try {
      const niveau = await Niveau.create({ ...data, created_by: userId });
      return { message: "Niveau ajoutée avec succès", niveau };
    } catch (error) {
      console.error("Erreur ajouterNiveau :", error);
      throw error;
    }
  }

  // Modifier une niveau
  static async modifierNiveau(niveauId, data, userId) {
    try {
      const niveau = await Niveau.findByPk(niveauId);
      if (!niveau) return { message: "Niveau non trouvée" };

      await niveau.update({ ...data, updated_by: userId });
      return { message: "Niveau modifiée avec succès", niveau };
    } catch (error) {
      console.error("Erreur modifierNiveau :", error);
      throw error;
    }
  }

  // Supprimer une niveau (soft delete)
  static async supprimerNiveau(niveauId, userId) {
    try {
      const niveau = await Niveau.findByPk(niveauId);
      if (!niveau) return { message: "Niveau non trouvée" };

      await niveau.destroy({ deleted_by: userId }); // soft delete car paranoid: true
      return { message: "Niveau supprimée avec succès" };
    } catch (error) {
      console.error("Erreur supprimerNiveau :", error);
      throw error;
    }
  }

  // Lister toutes les niveaux non supprimées
  static async listeNiveau() {
    try {
      const niveau = await Niveau.findAll({
        order: [['created_at', 'DESC']]
      });
      return { message: "Liste des niveaux", niveau };
    } catch (error) {
      console.error("Erreur listeNiveau :", error);
      throw error;
    }
  }

  static async getDashboardStats() {
  try {
    // 🔹 Pharmacies activées
    const pharmaciesActives = await Pharmacie.count({
      include: [{
        model: User,
        as: 'pharmacien',
        where: { statut: 'actif' }
      }]
    });

    // 🔹 Pharmacies en attente
    const pharmaciesEnAttente = await Pharmacie.count({
      include: [{
        model: User,
        as: 'pharmacien',
        where: { statut: 'en_attente' }
      }]
    });

    // 🔹 Commandes validées
    const commandesValidees = await Commande.count({
      where: { statut: 'en_preparation' } // ou 'validee' selon ton système
    });

    // 🔹 Commandes en attente
    const commandesEnAttente = await Commande.count({
      where: { statut: 'en_attente' }
    });

    // 🔹 Nombre total de produits
    const totalProduits = await Produit.count();

    return {
      message: "Statistiques du dashboard",
      stats: {
        pharmaciesActives,
        pharmaciesEnAttente,
        commandesValidees,
        commandesEnAttente,
        totalProduits
      }
    };

  } catch (error) {
    console.error("Erreur getDashboardStats :", error);
    throw error;
  }
}




static async listeAdmins() {
  try {
    const admins = await User.findAll({
      where: { role: 'admin' },
      attributes: { exclude: ['mot_de_passe'] },
      order: [['created_at', 'DESC']]
    });

    return { message: "Liste des admins", admins };
  } catch (error) {
    console.error("Erreur listeAdmins :", error);
    throw error;
  }
}

static async creerAdmin(data, createdBy) {
  try {
    const hashedPassword = await bcrypt.hash(data.mot_de_passe, 10);

    const admin = await User.create({
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      mot_de_passe: hashedPassword,
      telephone: data.telephone,
      adresse: data.adresse,
      role: 'admin',
      statut: 'actif',
      permissions: data.permissions, // 🔥 important
      created_by: createdBy
    });

    return {
      message: "Admin créé avec succès",
      admin
    };

  } catch (error) {
    console.error("Erreur creerAdmin :", error);
    throw error;
  }
}

static async modifierAdmin(adminId, data, updatedBy) {
  try {
    const admin = await User.findByPk(adminId);

    if (!admin || admin.role !== 'admin') {
      return { message: "Admin non trouvé" };
    }

    await admin.update({
      ...data,
      updated_by: updatedBy
    });

    return {
      message: "Admin modifié avec succès",
      admin
    };

  } catch (error) {
    console.error("Erreur modifierAdmin :", error);
    throw error;
  }
}

static async supprimerAdmin(adminId, deletedBy) {
  try {
    const admin = await User.findByPk(adminId);

    if (!admin || admin.role !== 'admin') {
      return { message: "Admin non trouvé" };
    }

    await admin.update({ deleted_by: deletedBy });
    await admin.destroy(); // paranoid = true

    return { message: "Admin supprimé avec succès" };

  } catch (error) {
    console.error("Erreur supprimerAdmin :", error);
    throw error;
  }
}


 static async ajoutAdmin({
  nom,
  prenom,
  email,
  mot_de_passe,
  adresse,
  telephone,
  photoProfil,
  role = 'admin',
  permissions = []
}) {

  const t = await sequelize.transaction();

  try {
    const emailClean = email.trim().toLowerCase();

    // 🔍 Vérification email
    const exist = await User.findOne({
      where: { email: emailClean },
      transaction: t
    });

    if (exist) {
      await t.rollback();
      return { success: false, message: "Cet email est déjà utilisé" };
    }

    // 🔍 Vérification téléphone
    if (telephone) {
      const telExist = await User.findOne({
        where: { telephone },
        transaction: t
      });

      if (telExist) {
        await t.rollback();
        return { success: false, message: "Téléphone déjà utilisé" };
      }
    }

    // 🔐 Hash mot de passe
    const hashedPassword = await bcrypt.hash(
      mot_de_passe,
      bcryptConfig.saltRounds
    );

    // 🖼️ Upload photo
    let photoUrl = null;
    if (photoProfil?.buffer) {
      photoUrl = await uploadImage(photoProfil.buffer);
    }

    // 👤 Création utilisateur
    const utilisateur = await User.create({
      nom,
      prenom,
      email: emailClean,
      mot_de_passe: hashedPassword,
      adresse,
      telephone,
      photo_profil: photoUrl,
      role,
      aDejaConnecter: false
    }, { transaction: t });

    // 🎯 AJOUT DES PERMISSIONS
    if (permissions && permissions.length > 0) {
      const perms = await Permission.findAll({
        where: { id: permissions },
        transaction: t
      });

      await utilisateur.setPermissions(perms, { transaction: t });
    }

    await t.commit();

    return {
      success: true,
      message: "Création administrateur réussie",
      utilisateur
    };

  } catch (err) {
    await t.rollback();
    throw err;
  }
}

static async modifierAdmin(id, data) {
  const t = await sequelize.transaction();

  try {
    const admin = await User.findByPk(id, { transaction: t });

    if (!admin) {
      await t.rollback();
      return { success: false, message: "Admin introuvable" };
    }

    // 🔍 Vérifier email unique
    if (data.email) {
      const exist = await User.findOne({
        where: {
          email: data.email,
          id: { [Op.ne]: id }
        },
        transaction: t
      });

      if (exist) {
        await t.rollback();
        return { success: false, message: "Email déjà utilisé" };
      }
    }

    // 🔄 Update infos
    await admin.update({
      nom: data.nom ?? admin.nom,
      prenom: data.prenom ?? admin.prenom,
      email: data.email ?? admin.email,
      telephone: data.telephone ?? admin.telephone,
      adresse: data.adresse ?? admin.adresse,
      photo_profil: data.photo_profil ?? admin.photo_profil,
    }, { transaction: t });

    // 🎯 Update permissions
    if (data.permissions) {
      const perms = await Permission.findAll({
        where: { id: data.permissions },
        transaction: t
      });

      await admin.setPermissions(perms, { transaction: t });
    }

    await t.commit();

    return {
      success: true,
      message: "Admin modifié avec succès"
    };

  } catch (err) {
    await t.rollback();
    throw err;
  }
}

static async desactiverAdmin(id) {
  try {
    const admin = await User.findByPk(id);

    if (!admin) {
      return { success: false, message: "Admin introuvable" };
    }

    admin.statut = 'inactif';
    await admin.save();

    return {
      success: true,
      message: "Admin désactivé"
    };

  } catch (err) {
    throw err;
  }
}

static async activerAdmin(id) {
  try {
    const admin = await User.findByPk(id);

    if (!admin) {
      return { success: false, message: "Admin introuvable" };
    }

    admin.statut = 'actif';
    await admin.save();

    return {
      success: true,
      message: "Admin activé"
    };

  } catch (err) {
    throw err;
  }
}

static async listeAdmins() {
  try {
    const admins = await User.findAll({
      where: { role: 'admin' },
      attributes: { exclude: ['mot_de_passe'] },
      include: [
        {
          model: Permission,
          as: 'permissions',
          attributes: ['id', 'key', 'label'],
          through: { attributes: [] }
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return {
      success: true,
      admins
    };

  } catch (err) {
    throw err;
  }
}

static async listePermissions() {
  try {
    const permissions = await Permission.findAll({
      order: [['created_at', 'ASC']]
    });

    return {
      success: true,
      permissions
    };

  } catch (err) {
    throw err;
  }
}

static async ajouterPermission({ key, label }) {
  try {
    const exist = await Permission.findOne({ where: { key } });

    if (exist) {
      return { success: false, message: "Permission déjà existante" };
    }

    const permission = await Permission.create({ key, label });

    return {
      success: true,
      message: "Permission ajoutée",
      permission
    };

  } catch (err) {
    throw err;
  }
}

static async modifierPermission(id, data) {
  try {
    const permission = await Permission.findByPk(id);

    if (!permission) {
      return { success: false, message: "Permission introuvable" };
    }

    await permission.update({
      key: data.key ?? permission.key,
      label: data.label ?? permission.label
    });

    return {
      success: true,
      message: "Permission modifiée",
      permission
    };

  } catch (err) {
    throw err;
  }
}

static async supprimerPermission(id) {
  try {
    const permission = await Permission.findByPk(id);

    if (!permission) {
      return { success: false, message: "Permission introuvable" };
    }

    await permission.destroy();

    return {
      success: true,
      message: "Permission supprimée"
    };

  } catch (err) {
    throw err;
  }
}


}

module.exports = AdminService;
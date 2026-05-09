const { User, Pharmacie, Produit, Commande, CommandeDetails, Avantage, Conversion, Categorie, Niveau, Permission } = require('../../models');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { uploadImage } = require('../../middlewares/uploadService');
const sequelize = require('../../config/db');
const { bcryptConfig } = require('../../config/security');


class AdminService {

  static async activerUtilisateur(utilisateurId, adminId) {
    try {
      const admin = await User.findByPk(adminId);
      if (admin.role !== 'admin') {
        return {
          success: false,
          message: "Vous n'avez pas les permissions nécessaires"
        };
      }
      const utilisateur = await User.findByPk(utilisateurId);

      if (!utilisateur) {
        return {
          success: false,
          message: "Utilisateur que vous voulez activer n'est pas trouvé"
        };
      }

      // Mettre à jour le statut
      utilisateur.statut = 'actif';
      await utilisateur.save();

      return {
        success: true,
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

  static async desactiverUtilisateur(utilisateurId, adminId) {
    try {
      const admin = await User.findByPk(adminId);
      if (admin.role !== 'admin') {
        return {
          success: false,
          message: "Vous n'avez pas les permissions nécessaires"
        };
      }
      const utilisateur = await User.findByPk(utilisateurId);

      if (!utilisateur) {
        return {
          success: false,
          message: "Utilisateur que vous voulez désactiver n'est pas trouvé"
        };
      }

      // Mettre à jour le statut
      utilisateur.statut = 'inactif';
      await utilisateur.save();

      return {
        success: true,
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

  static async listerProduit(adminId) {
    try {
      const admin = await User.findByPk(adminId);
      if (admin.role !== 'admin') {
        return {
          success: false,
          message: "Vous n'avez pas les permissions nécessaires"
        };
      }
      const produits = await Produit.findAll({
        include: [
          { model: Categorie, as: 'categorie', attributes: ['id', 'nom'] },
          { model: User, as: 'createur', attributes: ['nom', 'prenom'] },
          { model: User, as: 'modificateur', attributes: ['nom', 'prenom'] },
        ],
        order: [['created_at', 'DESC']]
      });
      return {
        success: true,
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
      const admin = await User.findByPk(userId);
      if (admin.role !== 'admin') {
        return {
          success: false,
          message: "Vous n'avez pas les permissions nécessaires"
        };
      }
      const produit = await Produit.create({
        ...data,
        prix: Number(data.prix),
        prix_promo: data.prix_promo ? Number(data.prix_promo) : null,
        stock: data.stock ? Number(data.stock) : 0,
        categorie_id: data.categorie_id || null,
        statut: data.statut === 'true' || data.statut === true,
        created_by: userId
      });

      return {
        success: true,
        message: "Produit ajouté",
        produit
      };
    } catch (error) {
      console.error("Erreur ajouterProduit :", error);
      throw error;
    }
  }

  static async modifierProduit(produitId, data, adminId) {
    try {
      const admin = await User.findByPk(adminId);
      if (admin.role !== 'admin') {
        return {
          success: false,
          message: "Vous n'avez pas les permissions nécessaires"
        };
      }
      const produit = await Produit.findByPk(produitId);
      if (!produit) {
        return {
          success: false,
          message: "Produit que vous voulez modifier n'est pas trouvé"
        };
      }
      await produit.update({ ...data, updated_by: adminId });
      return {
        success: true,
        message: "Produit modifié",
        produit
      };
    } catch (error) {
      console.error("Erreur modifierProduit :", error);
      throw error;
    }
  }

  static async supprimerProduit(produitId, adminId) {
    try {
      const admin = await User.findByPk(adminId);
      if (admin.role !== 'admin') {
        return {
          success: false,
          message: "Vous n'avez pas les permissions nécessaires"
        };
      }
      const produit = await Produit.findByPk(produitId);
      if (!produit) {
        return {
          success: false,
          message: "Produit que vous voulez supprimer n'est pas trouvé"
        };
      }
      produit.deleted_by = adminId;
      await produit.save();
      await produit.destroy();
      return {
        success: true,
        message: "Produit supprimé avec succès"
      };
    } catch (error) {
      console.error("Erreur supprimerProduit :", error);
      throw error;
    }
  }

  static async listeCommandes(adminId) {
    try {
      const admin = await User.findByPk(adminId);
      if (admin.role !== 'admin') {
        return {
          success: false,
          message: "Vous n'avez pas les permissions nécessaires"
        };
      }
      const commandes = await Commande.findAll({
        include: [
          { model: Pharmacie, as: 'pharmacie' },
          { model: CommandeDetails, as: 'details', include: ['produit'] }
        ]
      });
      return {
        success: true,
        message: "Liste des commandes",
        commandes
      };
    } catch (error) {
      console.error("Erreur listeCommandes :", error);
      throw error;
    }
  }

  static async validerCommande(commandeId, adminId) {
    try {
      const admin = await User.findByPk(adminId);
      if (admin.role !== 'admin') {
        return {
          success: false,
          message: "Vous n'avez pas les permissions nécessaires"
        };
      }
      const commande = await Commande.findByPk(commandeId);
      if (!commande) {
        return {
          success: false,
          message: "Commande que vous voulez valider n'est pas trouvée"
        };
      }
      commande.statut = 'validee';
      commande.updated_by = adminId;
      await commande.save();
      return {
        success: true,
        message: "Commande validée",
        commande
      };
    } catch (error) {
      console.error("Erreur validerCommande :", error);
      throw error;
    }
  }

  static async rejeterCommande(commandeId, adminId) {
    try {
      const admin = await User.findByPk(adminId);
      if (admin.role !== 'admin') {
        return {
          success: false,
          message: "Vous n'avez pas les permissions nécessaires"
        };
      }
      const commande = await Commande.findByPk(commandeId);
      if (!commande) {
        return {
          success: false,
          message: "Commande que vous voulez rejeter n'est pas trouvée"
        };
      }
      commande.statut = 'annulee';
      commande.updated_by = adminId;
      await commande.save();
      return {
        success: true,
        message: "Commande rejetée",
        commande
      };
    } catch (error) {
      console.error("Erreur rejeterCommande :", error);
      throw error;
    }
  }

  static async livrerCommande(commandeId, adminId) {
    try {
      const admin = await User.findByPk(adminId);
      if (admin.role !== 'admin') {
        return {
          success: false,
          message: "Vous n'avez pas les permissions nécessaires"
        };
      }
      const commande = await Commande.findByPk(commandeId);
      if (!commande) {
        return {
          success: false,
          message: "Commande que vous voulez livrer n'est pas trouvée"
        };
      }
      commande.statut = 'livree';
      commande.updated_by = adminId;
      await commande.save();
      return {
        success: true,
        message: "Commande livrée",
        commande
      };
    } catch (error) {
      console.error("Erreur livrerCommande :", error);
      throw error;
    }
  }

  static async listePharmacies(adminId) {
    try {
      const admin = await User.findByPk(adminId);
      if (admin.role !== 'admin') {
        return {
          success: false,
          message: "Vous n'avez pas les permissions nécessaires"
        };
      }
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

      return {
        success: true,
        message: "Liste des pharmacies (utilisateurs actifs ou inactifs)",
        pharmacies
      };
    } catch (error) {
      console.error("Erreur listePharmacies :", error);
      throw error;
    }
  }

  static async getPharmacieDetails(pharmacieId, adminId) {
    try {
      const admin = await User.findByPk(adminId);
      if (admin.role !== 'admin') {
        return {
          success: false,
          message: "Vous n'avez pas les permissions nécessaires"
        };
      }
      const pharmacie = await Pharmacie.findByPk(pharmacieId, {
        include: [
          { model: User, as: 'pharmacien', attributes: ['id', 'nom', 'prenom', 'email', 'statut', 'role', 'telephone'] },
        ]
      });
      return {
        success: true,
        message: "Détails de la pharmacie",
        pharmacie
      };
    } catch (error) {
      console.error("Erreur getPharmacieDetails :", error);
      throw error;
    }
  }


  static async listePharmaciesEnAttente(adminId) {
    try {
      const admin = await User.findByPk(adminId);
      if (admin.role !== 'admin') {
        return {
          success: false,
          message: "Vous n'avez pas les permissions nécessaires"
        };
      }
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
        success: true,
        message: "Liste des pharmacies en attente",
        pharmacies
      };
    } catch (error) {
      console.error("Erreur listePharmaciesEnAttente :", error);
      throw error;
    }
  }

  static async validerInscriptionPharmacies(pharmacieId, adminId) {
    try {
      const admin = await User.findByPk(adminId);
      if (admin.role !== 'admin') {
        return {
          success: false,
          message: "Vous n'avez pas les permissions nécessaires"
        };
      }
      const pharmacie = await Pharmacie.findByPk(pharmacieId);
      if (!pharmacie) {
        return {
          success: false,
          message: "Pharmacie non trouvée"
        };
      }

      // Récupérer l'utilisateur lié à la pharmacie
      const utilisateur = await User.findByPk(pharmacie.pharmacienId);
      if (!utilisateur) return { message: "Utilisateur de la pharmacie non trouvé" };

      // Mettre à jour le statut de l'utilisateur
      utilisateur.statut = 'actif';
      utilisateur.updated_by = adminId;
      await utilisateur.save();

      return {
        success: true,
        message: "Inscription de la pharmacie validée",
        utilisateur
      };
    } catch (error) {
      console.error("Erreur validerInscriptionPharmacies :", error);
      throw error;
    }
  }

  static async rejeterInscriptionPharmacies(pharmacieId, adminId) {
    try {
      const admin = await User.findByPk(adminId);
      if (admin.role !== 'admin') {
        return {
          success: false,
          message: "Vous n'avez pas les permissions nécessaires"
        };
      }
      const pharmacie = await Pharmacie.findByPk(pharmacieId);
      if (!pharmacie) {
        return {
          success: false,
          message: "Pharmacie non trouvée"
        };
      }

      // Récupérer l'utilisateur lié à la pharmacie
      const utilisateur = await User.findByPk(pharmacie.pharmacienId);
      if (!utilisateur) {
        return {
          success: false,
          message: "Utilisateur de la pharmacie non trouvé"
        };
      }

      // Mettre à jour le statut de l'utilisateur
      utilisateur.statut = 'inactif';
      utilisateur.updated_by = adminId;
      await utilisateur.save();

      return {
        success: true,
        message: "Inscription de la pharmacie rejetée",
        utilisateur
      };
    } catch (error) {
      console.error("Erreur rejeterInscriptionPharmacies :", error);
      throw error;
    }
  }

  static async ajouterAvantage(pharmacieId, type, montant, adminId) {
    try {
      const admin = await User.findByPk(adminId);
      if (admin.role !== 'admin') {
        return {
          success: false,
          message: "Vous n'avez pas les permissions nécessaires"
        };
      }
      const pharmacie = await Pharmacie.findByPk(pharmacieId);
      if (!pharmacie) {
        return {
          success: false,
          message: "Pharmacie que vous voulez ajouter un avantage n'est pas trouvée"
        };
      }
      const avantage = await Avantage.create({
        pharmacie_id: pharmacieId,
        type,
        montant,
        created_by: adminId
      });
      return {
        success: true,
        message: "Avantage ajouté",
        avantage
      };
    } catch (error) {
      console.error("Erreur ajouterAvantage :", error);
      throw error;
    }
  }
  static async modifierAvantage(avantageId, data, adminId) {
    try {
      const admin = await User.findByPk(adminId);
      if (admin.role !== 'admin') {
        return {
          success: false,
          message: "Vous n'avez pas les permissions nécessaires"
        };
      }
      const avantage = await Avantage.findByPk(avantageId);
      if (!avantage) {
        return {
          success: false,
          message: "Avantage non trouvé"
        };
      }

      await avantage.update({ ...data, updated_by: adminId });
      return {
        success: true,
        message: "Avantage modifié",
        avantage
      };
    } catch (error) {
      console.error("Erreur modifierAvantage :", error);
      throw error;
    }
  }
  static async supprimerAvantage(avantageId, adminId) {
    try {
      const admin = await User.findByPk(adminId);
      if (admin.role !== 'admin') {
        return {
          success: false,
          message: "Vous n'avez pas les permissions nécessaires"
        };
      }
      const avantage = await Avantage.findByPk(avantageId);
      if (!avantage) {
        return {
          success: false,
          message: "Avantage que vous voulez supprimer n'est pas trouvé"
        };
      }

      // Mettre à jour deleted_by avant suppression
      await avantage.update({ deleted_by: adminId });

      // Soft delete
      await avantage.destroy();

      return {
        success: true,
        message: "Avantage supprimé avec succès",
        id: avantageId
      };
    } catch (error) {
      console.error("Erreur supprimerAvantage :", error);
      throw error;
    }
  }

  static async listeAvantages(adminId) {
    try {
      const admin = await User.findByPk(adminId);
      if (admin.role !== 'admin') {
        return {
          success: false,
          message: "Vous n'avez pas les permissions nécessaires"
        };
      }
      // Récupérer tous les avantages non supprimés
      const avantages = await Avantage.findAll({
        include: [{ model: Pharmacie, as: 'pharmacie' }],
        order: [['created_at', 'DESC']]
      });

      return {
        success: true,
        message: "Liste des avantages",
        avantages
      };
    } catch (error) {
      console.error("Erreur listeAvantages :", error);
      throw error;
    }
  }

  // Ajouter une catégorie
  static async ajouterCategorie(data, adminId) {
    try {
      const admin = await User.findByPk(adminId);
      if (admin.role !== 'admin') {
        return {
          success: false,
          message: "Vous n'avez pas les permissions nécessaires"
        };
      }

      const exist = await Categorie.findOne({
        where: { nom: data.nom }
      });

      if (exist) {
        return {
          success: false,
          message: "Cette catégorie existe déjà"
        }
      }
      const categorie = await Categorie.create({ ...data, created_by: adminId });
      return {
        success: true,
        message: "Catégorie ajoutée avec succès",
        categorie
      };
    } catch (error) {
      console.error("Erreur ajouterCategorie :", error);
      throw error;
    }
  }

  // Modifier une catégorie
  static async modifierCategorie(categorieId, data, adminId) {
    try {
      const admin = await User.findByPk(adminId);
      if (admin.role !== 'admin') {
        return {
          success: false,
          message: "Vous n'avez pas les permissions nécessaires"
        };
      }
      const categorie = await Categorie.findByPk(categorieId);
      if (!categorie) {
        return {
          success: false,
          message: "Catégorie non trouvée"
        };
      }

      await categorie.update({ ...data, updated_by: adminId });
      return {
        success: true,
        message: "Catégorie modifiée avec succès",
        categorie
      };
    } catch (error) {
      console.error("Erreur modifierCategorie :", error);
      throw error;
    }
  }

  // Supprimer une catégorie (soft delete)
  static async supprimerCategorie(categorieId, adminId) {
    try {
      const admin = await User.findByPk(adminId);
      if (admin.role !== 'admin') {
        return {
          success: false,
          message: "Vous n'avez pas les permissions nécessaires"
        };
      }
      const categorie = await Categorie.findByPk(categorieId);
      if (!categorie) {
        return {
          success: false,
          message: "Catégorie non trouvée"
        };
      }
      categorie.deleted_by = adminId;
      await categorie.save();
      await categorie.destroy();
      return {
        success: true,
        message: "Catégorie supprimée avec succès"
      };
    } catch (error) {
      console.error("Erreur supprimerCategorie :", error);
      throw error;
    }
  }

  // Lister toutes les catégories non supprimées
  static async listeCategories(adminId) {
    try {
      const admin = await User.findByPk(adminId);
      if (admin.role !== 'admin') {
        return {
          success: false,
          message: "Vous n'avez pas les permissions nécessaires"
        };
      }
      const categories = await Categorie.findAll({
        order: [['created_at', 'DESC']]
      });
      return {
        success: true,
        message: "Liste des catégories",
        categories
      };
    } catch (error) {
      console.error("Erreur listeCategories :", error);
      throw error;
    }
  }

  // Ajouter une niveau
  static async ajouterNiveau(data, adminId) {
    try {
      const admin = await User.findByPk(adminId);
      if (admin.role !== 'admin') {
        return {
          success: false,
          message: "Vous n'avez pas les permissions nécessaires"
        };
      }

      const exist = await Niveau.findOne({
        where: { nom: data.nom }
      });

      if (exist) {
        return {
          success: false,
          message: "Ce niveau existe déjà"
        }
      }
      const niveau = await Niveau.create({ ...data, created_by: adminId });
      return {
        success: true,
        message: "Niveau ajoutée avec succès",
        niveau
      };
    } catch (error) {
      console.error("Erreur ajouterNiveau :", error);
      throw error;
    }
  }

  // Modifier une niveau
  static async modifierNiveau(niveauId, data, adminId) {
    try {
      const admin = await User.findByPk(adminId);
      if (admin.role !== 'admin') {
        return {
          success: false,
          message: "Vous n'avez pas les permissions nécessaires"
        };
      }
      const niveau = await Niveau.findByPk(niveauId);
      if (!niveau) {
        return {
          success: false,
          message: "Niveau non trouvée"
        };
      }

      await niveau.update({ ...data, updated_by: adminId });
      return {
        success: true,
        message: "Niveau modifiée avec succès",
        niveau
      };
    } catch (error) {
      console.error("Erreur modifierNiveau :", error);
      throw error;
    }
  }

  // Supprimer une niveau (soft delete)
  static async supprimerNiveau(niveauId, adminId) {
    try {
      const admin = await User.findByPk(adminId);
      if (admin.role !== 'admin') {
        return {
          success: false,
          message: "Vous n'avez pas les permissions nécessaires"
        };
      }
      const niveau = await Niveau.findByPk(niveauId);
      if (!niveau) {
        return {
          success: false,
          message: "Niveau non trouvée"
        };
      }

      niveau.deleted_by = adminId;
      await niveau.save();
      await niveau.destroy();
      return {
        success: true,
        message: "Niveau supprimée avec succès"
      };
    } catch (error) {
      console.error("Erreur supprimerNiveau :", error);
      throw error;
    }
  }

  // Lister toutes les niveaux non supprimées
  static async listeNiveau(adminId) {
    try {
      const admin = await User.findByPk(adminId);
      if (admin.role !== 'admin') {
        return {
          success: false,
          message: "Vous n'avez pas les permissions nécessaires"
        };
      }
      const niveau = await Niveau.findAll({
        order: [['created_at', 'DESC']]
      });
      return {
        success: true,
        message: "Liste des niveaux",
        niveau
      };
    } catch (error) {
      console.error("Erreur listeNiveau :", error);
      throw error;
    }
  }

  static async getDashboardStats(adminId) {
    try {
      const admin = await User.findByPk(adminId);
      if (!admin) {
        return {
          success: false,
          message: "Utilisateur introuvable"
        };
      }
      if (admin.role !== 'admin') {
        return {
          success: false,
          message: "Vous n'avez pas les permissions nécessaires"
        };
      }
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
        where: { statut: 'validee' }
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

  static async modifierAdmin(adminId, data, updatedBy) {
    try {
      const adminAModifier = await User.findByPk(adminId);

      if (!adminAModifier || adminAModifier.role !== 'admin') {
        return {
          success: false,
          message: "Admin a modifier non trouver ou n'est pas un admin"
        };
      }

      const adminWhoIsModifying = await User.findByPk(updatedBy);
      if (!adminWhoIsModifying || adminWhoIsModifying.role !== 'admin') {
        return {
          success: false,
          message: "Admin modificateur non trouver ou n'est pas un admin"
        };
      }

      if (data.mot_de_passe) {
        const hashedPassword = await bcrypt.hash(data.mot_de_passe, 10);
        data.mot_de_passe = hashedPassword;
      }

      await adminAModifier.update({
        ...data,
        updated_by: updatedBy
      });

      return {
        success: true,
        message: "Admin modifié avec succès",
        admin: adminAModifier
      };

    } catch (error) {
      console.error("Erreur modifierAdmin :", error);
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
    permissions = [],
    adminId
  }) {

    const adminWhoIsCreating = await User.findByPk(adminId);
    if (!adminWhoIsCreating || adminWhoIsCreating.role !== 'admin') {
      return {
        success: false,
        message: "Admin créateur non trouvé ou n'est pas un admin"
      };
    }

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
        aDejaConnecter: false,
        created_by: adminId,
        statut: 'actif',
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

  static async desactiverAdmin(id, adminId) {
    try {

      // 🔍 admin qui désactive
      const adminQuiDesactive = await User.findByPk(adminId);

      if (!adminQuiDesactive || adminQuiDesactive.role !== 'admin') {
        return {
          success: false,
          message: "Vous n'avez pas les permissions nécessaires"
        };
      }

      // 🔍 admin à désactiver
      const admin = await User.findByPk(id);

      if (!admin || admin.role !== 'admin') {
        return {
          success: false,
          message: "Admin que vous voulez désactiver n'est pas un admin ou n'est pas trouvé"
        };
      }

      // ❌ empêcher auto désactivation
      if (admin.id === adminId) {
        return {
          success: false,
          message: "Vous ne pouvez pas désactiver votre propre compte"
        };
      }

      admin.statut = 'inactif';
      admin.updated_by = adminId;

      await admin.save();

      return {
        success: true,
        message: "Admin désactivé avec succès"
      };

    } catch (err) {
      throw err;
    }
  }

  static async activerAdmin(id, userId) {
    try {

      // 🔍 utilisateur connecté
      const currentUser = await User.findByPk(userId);

      if (!currentUser || currentUser.role !== 'admin') {
        return {
          success: false,
          message: "Vous n'avez pas les permissions nécessaires"
        };
      }

      const admin = await User.findByPk(id);

      if (!admin || admin.role !== 'admin') {
        return {
          success: false,
          message: "Admin que vous voulez activer n'est pas un admin ou n'est pas trouvé"
        };
      }

      admin.statut = 'actif';
      admin.updated_by = userId;

      await admin.save();

      return {
        success: true,
        message: "Admin activé"
      };

    } catch (err) {
      throw err;
    }
  }

  static async listeAdmins(adminId) {
    try {
      const adminQuiVeutLaListe = await User.findByPk(adminId);
      if (!adminQuiVeutLaListe || adminQuiVeutLaListe.role !== 'admin') {
        return {
          success: false,
          message: "Vous n'avez pas les permissions nécessaires"
        };
      }
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

  static async listePermissions(adminId) {
    try {
      const adminQuiVeutLaListe = await User.findByPk(adminId);
      if (!adminQuiVeutLaListe || adminQuiVeutLaListe.role !== 'admin') {
        return {
          success: false,
          message: "Vous n'avez pas les permissions nécessaires"
        };
      }
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

  static async ajouterPermission({ key, label }, adminId) {
    try {
      const adminQuiAjoute = await User.findByPk(adminId);
      if (!adminQuiAjoute || adminQuiAjoute.role !== 'admin') {
        return {
          success: false,
          message: "Vous n'avez pas les permissions nécessaires"
        };
      }
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

  static async modifierPermission(id, data, adminId) {
    try {
      const adminQuiModifie = await User.findByPk(adminId);
      if (!adminQuiModifie || adminQuiModifie.role !== 'admin') {
        return {
          success: false,
          message: "Vous n'avez pas les permissions nécessaires"
        };
      }
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

  static async supprimerPermission(id, adminId) {
    try {
      const adminQuiSupprime = await User.findByPk(adminId);
      if (!adminQuiSupprime || adminQuiSupprime.role !== 'admin') {
        return {
          success: false,
          message: "Vous n'avez pas les permissions nécessaires"
        };
      }
      const permission = await Permission.findByPk(id);

      if (!permission) {
        return { success: false, message: "Permission introuvable" };
      }

      const users = await permission.getUsers();

      if (users.length > 0) {
        return {
          success: false,
          message: "Permission utilisée par des admins"
        }
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
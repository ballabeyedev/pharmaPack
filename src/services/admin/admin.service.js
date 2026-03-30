const { User, Pharmacie, Produit, Commande, CommandeDetails, Avantage, Conversion, Categorie, Niveau } = require('../../models');

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
      const produits = await Produit.findAll();

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
      const produit = await Produit.create({ ...data, created_by: userId });
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
            attributes: ['id', 'nom', 'prenom', 'email', 'statut', 'role']
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
            attributes: ['id', 'nom', 'prenom', 'email', 'statut', 'role']
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
      const niveau = await Categorie.findByPk(niveau);
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

  // Lister toutes les catégories non supprimées
  static async listeNiveau() {
    try {
      const niveau = await Niveau.findAll({
        order: [['created_at', 'DESC']]
      });
      return { message: "Liste des catégories", niveau };
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
}

module.exports = AdminService;
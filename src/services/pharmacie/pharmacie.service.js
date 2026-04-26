const { Produit, Categorie, User, Commande, CommandeDetails, Pharmacie } = require('../../models');
const { Op } = require('sequelize');
const sequelize = require('../../config/db');

class PharmacieService {

  // ===================== PRODUITS =====================

  static async listerProduitsActif() {
    try {
      const produits = await Produit.findAll({
        where: {
          stock: { [Op.gt]: 0 },
          statut: true
        },
        include: [
          {
            model: Categorie,
            as: 'categorie',
            attributes: ['id', 'nom']
          }
        ]
      });

      return produits;

    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // ===================== RECHERCHE =====================

  static async rechercherProduits(query) {
    try {
      const { rows } = await Produit.findAndCountAll({
        where: {
          stock: { [Op.gt]: 0 }, // 🔥 correction (tu avais "quantite")
          statut: true,
          [Op.or]: [
            { nom: { [Op.iLike]: `%${query}%` } },
            { '$categorie.nom$': { [Op.iLike]: `%${query}%` } }
          ]
        },
        include: [
          {
            model: Categorie,
            as: 'categorie',
            attributes: ['nom'],
            required: false
          }
        ],
        order: [['nom', 'ASC']],
        distinct: true
      });

      return { produits: rows };

    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // ===================== PRODUIT DETAIL =====================

  static async getProduitById(id) {
    try {
      const produit = await Produit.findByPk(id, {
        include: [
          { model: Categorie, as: 'categorie', attributes: ['id', 'nom'] }
        ]
      });

      if (!produit) throw new Error("Produit introuvable");

      return produit;

    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // ===================== COMMANDER =====================

  static async commanderProduits(userId, produits) {
    const transaction = await sequelize.transaction();

    try {
      const pharmacie = await Pharmacie.findOne({
        where: { pharmacienId: userId }
      });

      if (!pharmacie) {
        throw new Error("Pharmacie introuvable");
      }

      let total = 0;

      for (const item of produits) {
        const produit = await Produit.findByPk(item.produit_id);

        if (!produit) throw new Error("Produit introuvable");

        if (produit.stock < item.quantite) {
          throw new Error(`Stock insuffisant pour ${produit.nom}`);
        }

        total += produit.prix * item.quantite;
      }

      const commande = await Commande.create({
        pharmacie_id: pharmacie.id,
        montant_total: total,
        created_by: userId
      }, { transaction });

      for (const item of produits) {
        const produit = await Produit.findByPk(item.produit_id);

        await CommandeDetails.create({
          commande_id: commande.id,
          produit_id: produit.id,
          quantite: item.quantite,
          prix_unitaire: produit.prix,
          prix_total: produit.prix * item.quantite
        }, { transaction });

        produit.stock -= item.quantite;
        await produit.save({ transaction });
      }

      await transaction.commit();

      return { message: "Commande réussie", commande };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // ===================== COMMANDES =====================

  static async mesCommandesLivree(userId) {
    try {
      const pharmacie = await Pharmacie.findOne({
        where: { pharmacienId: userId }
      });

      if (!pharmacie) {
        throw new Error("Pharmacie introuvable");
      }
      return await Commande.findAll({
        where: { pharmacie_id: pharmacie.id, statut: 'livree' },
        include: [{ model: CommandeDetails, as: 'details' }]
      });

    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  //nombre de commande livree

  static async nombreCommandeLivree(userId) {
    try {
      const pharmacie = await Pharmacie.findOne({
        where: { pharmacienId: userId }
      });

      if (!pharmacie) {
        throw new Error("Pharmacie introuvable");
      }
      return await Commande.count({
        where: { pharmacie_id: pharmacie.id, statut: 'livree' }
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async mesCommandesEnAttente(userId) {
    try {
      const pharmacie = await Pharmacie.findOne({
        where: { pharmacienId: userId }
      });

      if (!pharmacie) {
        throw new Error("Pharmacie introuvable");
      }
      return await Commande.findAll({
        where: { pharmacie_id: pharmacie.id, statut: 'en_attente' },
        include: [{ model: CommandeDetails, as: 'details' }]
      });

    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  //nombre de commande en attente
  static async nombreCommandeEnAttente(userId) {
    try {
      const pharmacie = await Pharmacie.findOne({
        where: { pharmacienId: userId }
      });

      if (!pharmacie) {
        throw new Error("Pharmacie introuvable");
      }
      return await Commande.count({
        where: { pharmacie_id: pharmacie.id, statut: 'en_attente' }
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }


  static async mesCommandesAnnulees(userId) {
    try {
      const pharmacie = await Pharmacie.findOne({
        where: { pharmacienId: userId }
      });

      if (!pharmacie) {
        throw new Error("Pharmacie introuvable");
      }
      return await Commande.findAll({
        where: { pharmacie_id: pharmacie.id, statut: 'annulee' },
        include: [{ model: CommandeDetails, as: 'details' }]
      });

    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  //nombre de commande annulee
  static async nombreCommandeAnnulee(userId) {
    try {
      const pharmacie = await Pharmacie.findOne({
        where: { pharmacienId: userId }
      });

      if (!pharmacie) {
        throw new Error("Pharmacie introuvable");
      }
      return await Commande.count({
        where: { pharmacie_id: pharmacie.id, statut: 'annulee' }
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // 🔥 correction : tu avais "etat" alors que ton modèle utilise "statut"
  static async mesCommandesValidees(userId) {
    try {
      const pharmacie = await Pharmacie.findOne({
        where: { pharmacienId: userId }
      });

      if (!pharmacie) {
        throw new Error("Pharmacie introuvable");
      }
      return await Commande.findAll({
        where: { pharmacie_id: pharmacie.id, statut: 'valider' }, // ou adapte selon logique
        include: [{ model: CommandeDetails, as: 'details' }]
      });

    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  //nombre de commande valider
  static async nombreCommandeValidees(userId) {
    try {
      const pharmacie = await Pharmacie.findOne({
        where: { pharmacienId: userId }
      });

      if (!pharmacie) {
        throw new Error("Pharmacie introuvable");
      }
      return await Commande.count({
        where: { pharmacie_id: pharmacie.id, statut: 'valider' }
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async mesCommandesRejetees(userId) {
    try {
      const pharmacie = await Pharmacie.findOne({
        where: { pharmacienId: userId }
      });

      if (!pharmacie) {
        throw new Error("Pharmacie introuvable");
      }
      return await Commande.findAll({
        where: { pharmacie_id: pharmacie.id, statut: 'rejeter' },
        include: [{ model: CommandeDetails, as: 'details' }]
      });

    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  //nombre de commande rejeter
  static async nombreCommandeRejetees(userId) {
    try {
      const pharmacie = await Pharmacie.findOne({
        where: { pharmacienId: userId }
      });

      if (!pharmacie) {
        throw new Error("Pharmacie introuvable");
      }
      return await Commande.count({
        where: { pharmacie_id: pharmacie.id, statut: 'rejeter' }
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  //nombre total de commande
  static async nombreTotalDeCommandes(userId) {
    try {
      const pharmacie = await Pharmacie.findOne({
        where: { pharmacienId: userId }
      });

      if (!pharmacie) {
        throw new Error("Pharmacie introuvable");
      }

      return await Commande.count({
        where: { pharmacie_id: pharmacie.id }
      });

    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async detailCommande(id) {
    try {
      const commande = await Commande.findByPk(id, {
        include: [{ model: CommandeDetails, as: 'details' }]
      });

      if (!commande) throw new Error("Commande introuvable");

      return commande;

    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async annulerCommande(id) {
    try {
      const pharmacie = await Pharmacie.findOne({
        where: { pharmacienId: userId }
      });

      if (!pharmacie) {
        throw new Error("Pharmacie introuvable");
      }
      const commande = await Commande.findByPk(id);

      if (!commande) throw new Error("Commande introuvable");

      if (commande.statut === 'livree') {
        throw new Error("Impossible d'annuler une commande livrée");
      }

      commande.statut = 'annulee';
      await commande.save();

      return commande;

    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  //historique des 10 derniers comamndes
  static async historiqueCommandes(userId) {
    try {
      const pharmacie = await Pharmacie.findOne({
        where: { pharmacienId: userId }
      });

      if (!pharmacie) {
        throw new Error("Pharmacie introuvable");
      }

      return await Commande.findAll({
        where: { pharmacie_id: pharmacie.id },
        include: [{ model: CommandeDetails, as: 'details' }],
        order: [['createdAt', 'DESC']],
        limit: 10
      });

    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

module.exports = PharmacieService;
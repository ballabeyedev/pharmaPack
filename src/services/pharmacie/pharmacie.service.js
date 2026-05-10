const { Produit, Categorie, Commande, CommandeDetails, Pharmacie } = require('../../models');
const { Op } = require('sequelize');
const sequelize = require('../../config/db');
const crypto = require("crypto");

class PharmacieService {

  static async generateReference(transaction) {
    const date = new Date();
    const YYYY = date.getFullYear();
    const MM = String(date.getMonth() + 1).padStart(2, '0');
    const DD = String(date.getDate()).padStart(2, '0');

    const random = crypto.randomBytes(3).toString('hex').toUpperCase();

    const reference = `CMD-${YYYY}${MM}${DD}-${random}`;

    const exists = await Commande.findOne({
      where: { reference },
      transaction
    });

    if (exists) {
      return await this.generateReference(transaction);
    }

    return reference;
  }

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

      return {
        success: true,
        message: "Produits actifs",
        produits
      };

    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // ===================== RECHERCHE =====================

  static async rechercherProduits(query) {
    try {

      const { rows: produits, count } = await Produit.findAndCountAll({

        where: {
          stock: {
            [Op.gt]: 0
          },

          statut: true,

          [Op.or]: [
            {
              nom: {
                [Op.iLike]: `%${query}%`
              }
            },

            {
              '$categorie.nom$': {
                [Op.iLike]: `%${query}%`
              }
            }
          ]
        },

        attributes: [
          'id',
          'nom',
          'description',
          'prix',
          'stock',
          'image'
        ],

        include: [
          {
            model: Categorie,
            as: 'categorie',
            attributes: ['id', 'nom'],
            required: false
          }
        ],

        order: [['nom', 'ASC']],
        distinct: true
      });

      return {
        success: true,
        message: "Produits recherchés",
        total: count,
        produits
      };

    } catch (error) {
      console.error("Erreur rechercherProduits :", error);

      return {
        success: false,
        message: "Erreur lors de la recherche des produits",
        error: error.message
      };
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

      if (!produit) {
        return {
          success: false,
          message: "Produit non trouvé"
        };
      }

      return {
        success: true,
        message: "Produit trouvé",
        produit
      };

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
        await transaction.rollback();
        return {
          success: false,
          message: "Pharmacie non trouvée"
        };
      }

      let total = 0;

      for (const item of produits) {
        const produit = await Produit.findByPk(item.produit_id, {
          transaction,
          lock: transaction.LOCK.UPDATE
        });

        if (!produit) {
          await transaction.rollback();
          return {
            success: false,
            message: "Produit non trouvé"
          };
        }

        if (produit.stock < item.quantite) {
          await transaction.rollback();
          return {
            success: false,
            message: `Stock insuffisant pour ${produit.nom} . Stock disponible : ${produit.stock} et quantite demandee : ${item.quantite}`
          };
        }

        total += produit.prix * item.quantite;
      }

      const reference = await this.generateReference(transaction);

      const commande = await Commande.create({
        pharmacie_id: pharmacie.id,
        montant_total: total,
        created_by: userId,
        reference: reference
      }, { transaction });

      for (const item of produits) {
        const produit = await Produit.findByPk(item.produit_id, {
          transaction,
          lock: transaction.LOCK.UPDATE
        });

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

      return {
        success: true,
        message: "Commande réussie",
        commande
      };

    } catch (error) {
      await transaction.rollback();
      return {
        success: false,
        message: "Erreur lors de la commande",
        error: error.message
      };
    }
  }

  // ===================== COMMANDES =====================

  static async mesCommandesLivree(userId) {
    try {
      const pharmacie = await Pharmacie.findOne({
        where: { pharmacienId: userId }
      });

      if (!pharmacie) {
        return {
          success: false,
          message: "Pharmacie non trouvée"
        };
      }

      const commandes = await Commande.findAll({
        where: {
          pharmacie_id: pharmacie.id,
          statut: 'livree'
        },
        include: [
          { model: CommandeDetails, as: 'details' }
        ]
      });

      return {
        success: true,
        message: "Commandes livrees",
        commandes
      };

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
        return {
          success: false,
          message: "Pharmacie non trouvée"
        };
      }

      const nombre = await Commande.count({
        where: {
          pharmacie_id: pharmacie.id,
          statut: 'livree'
        }
      });

      return {
        success: true,
        message: "Nombre de commandes livrees",
        nombre
      };
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
        return {
          success: false,
          message: "Pharmacie non trouvée"
        };
      }

      const commandes = await Commande.findAll({
        where: {
          pharmacie_id: pharmacie.id,
          statut: 'en_attente'
        },
        include: [{ model: CommandeDetails, as: 'details' }]
      });

      return {
        success: true,
        message: "Commandes en attente",
        commandes
      };

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
        return {
          success: false,
          message: "Pharmacie non trouvée"
        };
      }
      const nombre = await Commande.count({
        where: { pharmacie_id: pharmacie.id, statut: 'en_attente' }
      });
      return {
        success: true,
        message: "Nombre de commandes en attente",
        nombre
      };
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
        return {
          success: false,
          message: "Pharmacie non trouvée"
        };
      }
      const commandes = await Commande.findAll({
        where: {
          pharmacie_id: pharmacie.id,
          statut: 'annulee'
        },
        include: [{ model: CommandeDetails, as: 'details' }]
      });

      return {
        success: true,
        message: "Commandes annulees",
        commandes
      };

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
        return {
          success: false,
          message: "Pharmacie non trouvée"
        };
      }
      const nombre = await Commande.count({
        where: { pharmacie_id: pharmacie.id, statut: 'annulee' }
      });
      return {
        success: true,
        message: "Nombre de commandes annulees",
        nombre
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async mesCommandesValidees(userId) {
    try {
      const pharmacie = await Pharmacie.findOne({
        where: { pharmacienId: userId }
      });

      if (!pharmacie) {
        return {
          success: false,
          message: "Pharmacie non trouvée"
        };
      }
      const commandes = await Commande.findAll({
        where: { pharmacie_id: pharmacie.id, statut: 'valider' }, // ou adapte selon logique
        include: [{ model: CommandeDetails, as: 'details' }]
      });
      return {
        success: true,
        message: "Commandes validees",
        commandes
      };

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
        return {
          success: false,
          message: "Pharmacie non trouvée"
        };
      }
      const nombre = await Commande.count({
        where: { pharmacie_id: pharmacie.id, statut: 'valider' }
      });
      return {
        success: true,
        message: "Nombre de commandes validees",
        nombre
      };
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
        return {
          success: false,
          message: "Pharmacie non trouvée"
        };
      }
      const commandes = await Commande.findAll({
        where: { pharmacie_id: pharmacie.id, statut: 'rejeter' },
        include: [{ model: CommandeDetails, as: 'details' }]
      });
      return {
        success: true,
        message: "Commandes rejetees",
        commandes
      };

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
        return {
          success: false,
          message: "Pharmacie non trouvée"
        };
      }
      const nombre = await Commande.count({
        where: { pharmacie_id: pharmacie.id, statut: 'rejeter' }
      });
      return {
        success: true,
        message: "Nombre de commandes rejetees",
        nombre
      };
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
        return {
          success: false,
          message: "Pharmacie non trouvée"
        };
      }
      const nombre = await Commande.count({
        where: { pharmacie_id: pharmacie.id }
      });
      return {
        success: true,
        message: "Nombre total de commandes",
        nombre
      };

    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async detailCommande(id, userId) {
    try {
      const pharmacie = await Pharmacie.findOne({
        where: { pharmacienId: userId }
      });

      if (!pharmacie) {
        return {
          success: false,
          message: "Pharmacie non trouvée"
        };
      }
      const commande = await Commande.findOne({
        where: {
          id,
          pharmacie_id: pharmacie.id
        },
        include: [
          {
            model: CommandeDetails,
            as: 'details',
            include: [
              {
                model: Produit,
                as: 'produit',
                attributes: ['id', 'nom', 'prix', 'image']
              }
            ]
          }
        ]
      });

      if (!commande) {
        return {
          success: false,
          message: "Commande non trouvée"
        };
      }
      return {
        success: true,
        message: "Commande trouvée",
        commande
      };

    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async annulerCommande(id, userId, motifAnnulation) {
    try {
      const pharmacie = await Pharmacie.findOne({
        where: { pharmacienId: userId }
      });

      if (!pharmacie) {
        return {
          success: false,
          message: "Pharmacie non trouvée"
        };
      }

      const commande = await Commande.findOne({
        where: {
          id,
          pharmacie_id: pharmacie.id
        }
      });

      if (!commande) {
        return {
          success: false,
          message: "Commande non trouvée"
        };
      }

      if (commande.statut === 'livree' || commande.statut === 'annulee') {
        return {
          success: false,
          message: "Impossible d'annuler une commande livrée ou deja annulée"
        };
      }

      commande.statut = 'annulee';
      commande.motif_annulation = motifAnnulation;

      await commande.save();

      return {
        success: true,
        message: "Commande annulée avec succès",
        commande
      };

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
        return {
          success: false,
          message: "Pharmacie non trouvée"
        };
      }

      const commandes = await Commande.findAll({
        where: { pharmacie_id: pharmacie.id },
        include: [
          {
            model: CommandeDetails,
            as: 'details',
            attributes: ['quantite', 'prix_unitaire', 'prix_total'],
            include: [
              {
                model: Produit,
                as: 'produit',
                attributes: ['nom']
              }
            ]
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: 10
      });

      return {
        success: true,
        message: "Historique des commandes",
        commandes
      };

    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

module.exports = PharmacieService;
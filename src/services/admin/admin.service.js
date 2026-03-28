const { User, Pharmacie } = require('../../models');
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

}

module.exports = AdminService;
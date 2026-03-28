// controllers/admin.controller.js
const AdminService = require('../../services/admin/admin.service');
const formatUser = require('../../utils/formatUser');

/**
 * Activer un utilisateur
 * @route   PUT /admin/utilisateur/:id/activer
 * @access  Admin
 */
const activerUtilisateur = async (req, res) => {
  try {
    const utilisateurId = req.params.id;

    // Appel du service pour activer l'utilisateur
    const result = await AdminService.activerUtilisateur(utilisateurId);

    if (!result.utilisateur) {
      return res.status(404).json({ message: result.message });
    }

    // Formater l'utilisateur avant de renvoyer
    const utilisateurFormate = formatUser(result.utilisateur);

    return res.status(200).json({
      message: result.message,
      utilisateur: utilisateurFormate
    });

  } catch (error) {
    console.error("Erreur dans activerUtilisateur controller :", error);
    return res.status(500).json({
      message: "Une erreur est survenue lors de l'activation de l'utilisateur",
      error: error.message
    });
  }
};

module.exports = {
  activerUtilisateur
};
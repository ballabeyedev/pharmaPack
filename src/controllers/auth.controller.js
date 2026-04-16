const AuthService = require('../services/auth.service');
const formatUser = require('../utils/formatUser');

exports.inscriptionUser = async (req, res) => {
  try {
    const {
      nom,
      prenom,
      email,
      mot_de_passe,
      adresse,
      telephone,
      role,

      nom_pharmacie,
      email_pharmacie,
      telephone_pharmacie,
      ville_pharmacie,
      adresse_pharmacie
    } = req.body;

    const photoProfil = req.files?.['photoProfil']?.[0] || null;
    const logo = req.files?.['logo']?.[0] || null;

    let pharmacieData = null;

    if (role === 'pharmacie' && nom_pharmacie) {
      pharmacieData = {
        nom_pharmacie,
        email_pharmacie,
        telephone_pharmacie,
        ville_pharmacie,
        adresse_pharmacie,
        logo
      };
    }

    const result = await AuthService.register({
      nom,
      prenom,
      email,
      mot_de_passe,
      adresse,
      telephone,
      photoProfil,
      role,
      pharmacie: pharmacieData
    });

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    return res.status(201).json({
      message: result.message,
      utilisateur: formatUser(result.utilisateur),
      pharmacie: result.pharmacie
    });

  } catch (err) {
    console.error('Erreur lors de l’inscription :', err);
    return res.status(500).json({
      message: 'Erreur serveur lors de l’inscription',
      erreur: err.message
    });
  }
};

exports.login = async (req, res) => {
  const { email, telephone, mot_de_passe } = req.body;
  
  // Choisir identifiant : email ou téléphone
  const identifiant = email || telephone;
  
  if (!identifiant || !mot_de_passe) {
    return res.status(400).json({ message: 'Email/Téléphone et mot de passe sont obligatoires' });
  }

  try {
    const { token, utilisateur, error } = await AuthService.login({ identifiant, mot_de_passe });

    if (error) return res.status(400).json({ message: error });

    return res.status(200).json({
      token,
      utilisateur: formatUser(utilisateur)
    });
  } catch (err) {
    console.error('Erreur connexion:', err);
    return res.status(500).json({
      message: 'Erreur serveur',
      erreur: err.message
    });
  }
};

exports.passwordOublie = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "L'email est obligatoire"
      });
    }

    const result = await AuthService.passwordOublie(email);

    return res.status(200).json({
      message: result.message
    });

  } catch (err) {
    console.error('Erreur password oublié:', err);
    return res.status(500).json({
      message: "Erreur serveur",
      erreur: err.message
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    // ✅ token vient de l'URL, newPassword vient du body
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Token et nouveau mot de passe sont obligatoires"
      });
    }

    const result = await AuthService.resetPassword(token, newPassword);

    return res.status(200).json({
      message: result.message
    });

  } catch (err) {
    console.error('Erreur reset password:', err);
    return res.status(400).json({
      message: err.message || "Erreur lors de la réinitialisation"
    });
  }
};
const { User, Pharmacie } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtConfig, bcryptConfig } = require('../config/security');
const sequelize = require('../config/db');
const { uploadImage } = require('../middlewares/uploadService');

class AuthService {

  static async register({
    nom,
    prenom,
    email,
    mot_de_passe,
    adresse,
    telephone,
    photoProfil,
    role = 'pharmacie',
    pharmacie
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
        role
      }, { transaction: t });

      let pharmacieCreated = null;

      if (role === 'pharmacie' && pharmacie) {

        // 🖼️ Upload logo pharmacie
        let logoUrl = null;
        if (pharmacie?.logo?.buffer) {
          logoUrl = await uploadImage(pharmacie.logo.buffer);
        }

        pharmacieCreated = await Pharmacie.create({
          nom_pharmacie: pharmacie.nom_pharmacie,
          email_pharmacie: pharmacie.email_pharmacie,
          telephone_pharmacie: pharmacie.telephone_pharmacie,
          ville_pharmacie: pharmacie.ville_pharmacie,
          adresse_pharmacie: pharmacie.adresse_pharmacie,
          logo: logoUrl,
          pharmacienId: utilisateur.id
        }, { transaction: t });
      }

      await t.commit();

      return {
        success: true,
        message: "Inscription réussie",
        utilisateur,
        pharmacie: pharmacieCreated
      };

    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  // -------------------- CONNEXION --------------------
  static async login({ identifiant, mot_de_passe }) {
    const isEmail = /\S+@\S+\.\S+/.test(identifiant);
    const utilisateur = await User.findOne({
      where: isEmail ? { email: identifiant } : { telephone: identifiant },
    });

    if (!utilisateur) 
      return { success: false, error: 'Identifiant ou mot de passe incorrect' };
    
    if (utilisateur.statut !== 'actif') {
      return {
        success: false,
        error: `Votre compte est ${utilisateur.statut}. Veuillez contacter le support ou réactiver votre compte.`
      };
    }

    const valid = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
    if (!valid) {
      return { success: false, message: 'Identifiant ou mot de passe incorrect' };
    }

    const token = jwt.sign({
      id: utilisateur.id,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      email: utilisateur.email,
      adresse: utilisateur.adresse,
      telephone: utilisateur.telephone,
      photoProfil: utilisateur.photo_profil,
      role: utilisateur.role,
    }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });

    return { success: true, token, utilisateur };
  }
}

module.exports = AuthService;
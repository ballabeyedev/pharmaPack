const { User, Pharmacie } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtConfig, bcryptConfig } = require('../config/security');
const sequelize = require('../config/db');
const { uploadImage } = require('../middlewares/uploadService');

const crypto = require("crypto");
const nodemailer = require("nodemailer");

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
      include: [
        {
          model: Pharmacie,
          as: 'pharmacies',
          attributes: ['id', 'nom_pharmacie', 'email_pharmacie', 'telephone_pharmacie', 'ville_pharmacie', 'adresse_pharmacie', 'logo']
        }
      ]
    });

    // ✅ Message volontairement vague pour la sécurité
    if (!utilisateur) {
      return { success: false, error: 'Identifiant ou mot de passe incorrect' };
    }

    // ✅ Messages clairs selon le statut du compte
    if (utilisateur.statut === 'en_attente') {
      return {
        success: false,
        error: 'Votre compte est en attente de validation par un administrateur.'
      };
    }

    if (utilisateur.statut === 'inactif') {
      return {
        success: false,
        error: 'Votre compte a été désactivé. Veuillez contacter le support.'
      };
    }

    if (utilisateur.statut !== 'actif') {
      return {
        success: false,
        error: `Votre compte est "${utilisateur.statut}". Veuillez contacter le support.`
      };
    }

    const valid = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
    if (!valid) {
      return { success: false, error: 'Identifiant ou mot de passe incorrect' };
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

  static async passwordOublie(email) {
    try {
      const utilisateur = await User.findOne({ where: { email } });

      if (!utilisateur) {
        return { message: "Utilisateur non trouvé" };
      }

      if (utilisateur.role !== "admin") {
        return { message: "Seuls les administrateurs peuvent utiliser cette fonctionnalité" };
      }

      const token = crypto.randomBytes(32).toString("hex");
      const expire = new Date(Date.now() + 3600000);

      utilisateur.reset_token = token;
      utilisateur.reset_token_expire = expire;
      await utilisateur.save();

      const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"PharmaPack" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Réinitialisation du mot de passe",
        html: `<a href="${resetLink}">${resetLink}</a>`,
      });

      return { message: "Email envoyé avec succès" };

    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async resetPassword(token, newPassword) {
    const user = await User.findOne({
      where: { reset_token: token },
    });

    if (!user || new Date() > user.reset_token_expire) {
      throw new Error("Token invalide ou expiré");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.mot_de_passe = hashedPassword;
    user.reset_token = null;
    user.reset_token_expire = null;

    await user.save();

    return { message: "Mot de passe mis à jour" };
  }

  static async changerInformations(utilisateur, updates) {
    try {
      const { nom, prenom, telephone, adresse, photoProfil } = updates;

      utilisateur.nom = nom || utilisateur.nom;
      utilisateur.prenom = prenom || utilisateur.prenom;
      utilisateur.telephone = telephone || utilisateur.telephone;
      utilisateur.adresse = adresse || utilisateur.adresse;
      utilisateur.photo_profil = photoProfil || utilisateur.photo_profil;

      await utilisateur.save();

      return { message: "Informations mises à jour" };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async changerPassword(utilisateur, ancienMotDePasse, nouveauMotDePasse) {
    try {
      const isMatch = await bcrypt.compare(ancienMotDePasse, utilisateur.mot_de_passe);

      if (!isMatch) {
        throw new Error("Ancien mot de passe incorrect");
      }

      const hashedPassword = await bcrypt.hash(nouveauMotDePasse, 10);

      utilisateur.mot_de_passe = hashedPassword;
      await utilisateur.save();

      return { message: "Mot de passe mis à jour" };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

module.exports = AuthService;
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const {User} = require("../../models");

class AccountAdminService {

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
}

module.exports = AccountAdminService;
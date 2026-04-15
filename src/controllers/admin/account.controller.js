import AccountAdminService from "../../services/admin/account.service.js";
class AccountAdminController {

  // 📩 Demande de reset
  static async passwordOublie(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email requis" });
      }

      const result = await AccountAdminService.passwordOublie(email);

      return res.status(200).json(result);

    } catch (error) {
      console.error("Erreur controller passwordOublie :", error);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  }

  // 🔐 Reset du mot de passe
  static async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;

      if (!newPassword) {
        return res.status(400).json({ message: "Mot de passe requis" });
      }

      const result = await AccountAdminService.resetPassword(token, newPassword);

      return res.status(200).json(result);

    } catch (error) {
      console.error("Erreur controller resetPassword :", error);
      return res.status(400).json({ message: error.message });
    }
  }
}

export default AccountAdminController;
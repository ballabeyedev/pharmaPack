const AccountAdminService = require("../../services/admin/account.service");

const passwordOublie = async (req, res) => {
  try {
    const result = await AccountAdminService.passwordOublie(req.body.email);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const result = await AccountAdminService.resetPassword(token, newPassword);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  passwordOublie,
  resetPassword,
};
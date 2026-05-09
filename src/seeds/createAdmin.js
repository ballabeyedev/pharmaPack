const bcrypt = require('bcrypt');
const { User } = require('../models');

async function createAdmin() {
    try {
        const email = "adminpharmapack1@gmail.com";

        const exist = await User.findOne({ where: { email } });

        if (exist) {
            console.log("⚠️ Admin déjà existant");
            return;
        }

        const passwordHash = await bcrypt.hash("admin123", 10);

        await User.create({
            nom: "BEYE",
            prenom: "Balla",
            email,
            mot_de_passe: passwordHash,
            role: "admin",
            statut: "actif",
            telephone: "771933073",
            adresse: "Dakar",
            aDejaConnecter: false
        });

        console.log("✅ Admin créé avec succès");

    } catch (error) {
        console.error("❌ Erreur seed admin :", error);
    }
}

module.exports = createAdmin;
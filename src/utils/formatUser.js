const formatUser = (utilisateur) => {
  const userFormatted = {
    id: utilisateur.id,
    nom: utilisateur.nom,
    prenom: utilisateur.prenom,
    email: utilisateur.email,
    adresse: utilisateur.adresse,
    telephone: utilisateur.telephone,
    photoProfil: utilisateur.photo_profil,
    role: utilisateur.role,
  };

  if (utilisateur.role === 'pharmacie' && utilisateur.pharmacies) {
    userFormatted.pharmacies = utilisateur.pharmacies;
  }

  return userFormatted;
};

module.exports = formatUser;
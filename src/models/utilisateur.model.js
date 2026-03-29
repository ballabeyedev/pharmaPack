const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  prenom: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },

  mot_de_passe: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  telephone: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },

  adresse: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  
  photo_profil: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  
  role: {
    type: DataTypes.ENUM('admin', 'pharmacie'),
    defaultValue: 'pharmacie',
    allowNull: false
  },

  statut: {
    type: DataTypes.ENUM('actif', 'inactif', 'en_attente'),
    defaultValue: 'en_attente',
  },

  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },

  updated_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },

  deleted_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },

  last_login: {
    type: DataTypes.DATE,
    allowNull: true,
  },

}, {
  tableName: 'utilisateurs',
  timestamps: true,
  paranoid: true, 
  underscored: true
});

module.exports = User;

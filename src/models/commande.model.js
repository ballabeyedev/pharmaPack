const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./utilisateur.model');
const Pharmacie = require('./pharmacie.model');

const Commande = sequelize.define('Commande', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  pharmacie_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'pharmacies',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },

  montant_total: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },

  statut: {
    type: DataTypes.ENUM('en_attente', 'en_preparation', 'en_livraison', 'livree', 'annulee'),
    defaultValue: 'en_attente',
    allowNull: false
  },

  adresse_livraison: {
    type: DataTypes.STRING,
    allowNull: true
  },

  mode_livraison: {
    type: DataTypes.ENUM('livraison', 'retrait_depot'),
    defaultValue: 'livraison'
  },

  created_by: {
    type: DataTypes.UUID,
    allowNull: true
  },
  updated_by: {
    type: DataTypes.UUID,
    allowNull: true
  },
  deleted_by: {
    type: DataTypes.UUID,
    allowNull: true
  }

}, {
  tableName: 'commandes',
  timestamps: true,
  paranoid: true,
  underscored: true
});

module.exports = Commande;
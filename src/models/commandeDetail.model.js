const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Commande = require('./commande.model');
const Produit = require('./produit.model');

const CommandeDetails = sequelize.define('CommandeDetails', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  commande_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'commandes',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },

  produit_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'produits',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },

  quantite: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },

  prix_unitaire: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },

  prix_total: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
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
  tableName: 'commande_details',
  timestamps: true,
  paranoid: true,
  underscored: true
});

module.exports = CommandeDetails;
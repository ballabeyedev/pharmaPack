const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Produit = require('./produit.model');

const Promotion = sequelize.define('Promotion', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  titre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reduction: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  date_debut: {
    type: DataTypes.DATE,
    allowNull: false
  },
  date_fin: {
    type: DataTypes.DATE,
    allowNull: false
  },
  produit_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'produits',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  }
}, {
  tableName: 'promotions',
  timestamps: true,
  createdAt: false,
  updatedAt: 'updated_at',
  underscored: true
});

module.exports = Promotion;
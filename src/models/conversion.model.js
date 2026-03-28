const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Pharmacie = require('./pharmacie.model');

const Conversion = sequelize.define('Conversion', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
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
  type_conversion: {
    type: DataTypes.ENUM('commande', 'marchandise', 'cash'),
    allowNull: false
  },
  montant: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  statut: {
    type: DataTypes.ENUM('en_attente', 'valide', 'refuse'),
    defaultValue: 'en_attente'
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  tableName: 'conversions',
  timestamps: true,
  updatedAt: false,
  underscored: true
});

module.exports = Conversion;
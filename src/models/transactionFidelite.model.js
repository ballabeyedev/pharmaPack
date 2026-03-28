const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Pharmacie = require('./pharmacie.model');

const TransactionFidelite = sequelize.define('TransactionFidelite', {
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
  type: {
    type: DataTypes.ENUM('gain', 'utilisation', 'conversion'),
    allowNull: false
  },
  montant: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  tableName: 'transactions_fidelite',
  timestamps: true,
  updatedAt: false,
  underscored: true
});

module.exports = TransactionFidelite;
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Pharmacie = require('./pharmacie.model');

const Avantage = sequelize.define('Avantage', {
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
    type: DataTypes.ENUM('remise_volume', 'bonus', 'ristourne'),
    allowNull: false
  },
  montant: {
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
  tableName: 'avantages',
  timestamps: true,
  updatedAt: false,
  underscored: true,
  paranoid: true, 
});

module.exports = Avantage;
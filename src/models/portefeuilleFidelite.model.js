const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Pharmacie = require('./pharmacie.model');

const PortefeuilleFidelite = sequelize.define('PortefeuilleFidelite', {
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
  solde: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'portefeuille_fidelite',
  timestamps: true,
  createdAt: false,
  updatedAt: 'updated_at',
  underscored: true
});

module.exports = PortefeuilleFidelite;
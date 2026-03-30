const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Niveau = sequelize.define('Niveau', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nom: {
    type: DataTypes.ENUM('Bronze', 'Silver', 'Gold'),
    allowNull: false
  },
  seuil_min: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  avantages: {
    type: DataTypes.TEXT, 
    allowNull: true
  }
}, {
  tableName: 'niveaux',
  timestamps: true,
  createdAt: 'created_at', 
  updatedAt: 'updated_at',
  underscored: true
});

module.exports = Niveau;
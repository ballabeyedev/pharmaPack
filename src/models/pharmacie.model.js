const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Pharmacie = sequelize.define('Pharmacie', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nom_pharmacie: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email_pharmacie: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  telephone_pharmacie: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ville_pharmacie: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  adresse_pharmacie: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pharmacienId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
        model: 'utilisateurs',
        key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
    },
}, {
  tableName: 'pharmacies',
  timestamps: true,
  paranoid: true, 
  underscored: true
});

module.exports = Pharmacie;

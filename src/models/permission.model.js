const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  label: {
    type: DataTypes.STRING,
    allowNull: false,
  }

}, {
  tableName: 'permissions',
  timestamps: true,
  underscored: true
});

module.exports = Permission;
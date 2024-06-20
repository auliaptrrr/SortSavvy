const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Scan = sequelize.define('Scan', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users', // Nama tabel referensi
            key: 'id',
        },
    },
    scanTime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW,
    },
});

module.exports = Scan;
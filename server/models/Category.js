import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Kategori Modeli
 * Gelir ve gider kategorilerini saklar
 */
const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Kullanıcı ID (null ise sistem kategorisi)'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Kategori adı'
  },
  type: {
    type: DataTypes.ENUM('income', 'expense'),
    allowNull: false,
    comment: 'Kategori tipi (income: Gelir, expense: Gider)'
  },
  color: {
    type: DataTypes.STRING(7),
    defaultValue: '#6B7280',
    comment: 'Kategori rengi (hex kod)'
  },
  icon: {
    type: DataTypes.STRING(50),
    defaultValue: 'tag',
    comment: 'Kategori ikonu'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Kategori açıklaması'
  },
  is_system: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Sistem kategorisi mi? (Silinemez)'
  }
}, {
  tableName: 'categories',
  timestamps: true,
  indexes: [
    {
      fields: ['user_id', 'type']
    },
    {
      fields: ['is_system']
    }
  ]
});

export default Category;


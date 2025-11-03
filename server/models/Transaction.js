import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * İşlem Modeli
 * Gelir ve gider işlemlerini saklar
 */
const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'İşlem sahibi kullanıcı ID'
  },
  account_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'accounts',
      key: 'id'
    },
    comment: 'İşlemin yapıldığı hesap ID'
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id'
    },
    comment: 'İşlem kategorisi ID'
  },
  type: {
    type: DataTypes.ENUM('income', 'expense', 'transfer'),
    allowNull: false,
    comment: 'İşlem tipi'
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    comment: 'İşlem tutarı'
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'TRY',
    comment: 'Para birimi'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'İşlem açıklaması'
  },
  transaction_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'İşlem tarihi'
  },
  // Transfer işlemleri için
  to_account_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'accounts',
      key: 'id'
    },
    comment: 'Transfer hedef hesap ID'
  },
  // Tekrarlanan işlemler için
  is_recurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Tekrarlanan işlem mi?'
  },
  recurring_type: {
    type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly'),
    allowNull: true,
    comment: 'Tekrarlama periyodu'
  },
  recurring_end_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Tekrarlama bitiş tarihi'
  },
  parent_transaction_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'transactions',
      key: 'id'
    },
    comment: 'Ana işlem ID (tekrarlanan işlemler için)'
  },
  // Fotoğraf ve notlar
  photo_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'İşlem fotoğrafı URL'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Ek notlar'
  },
  tags: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Etiketler (virgülle ayrılmış)'
  }
}, {
  tableName: 'transactions',
  timestamps: true,
  indexes: [
    {
      fields: ['user_id', 'transaction_date']
    },
    {
      fields: ['account_id']
    },
    {
      fields: ['category_id']
    }
  ]
});

export default Transaction;


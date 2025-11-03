import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Hesap Modeli
 * Kullanıcının banka hesapları, kredi kartları, nakit vb. hesaplarını saklar
 */
const Account = sequelize.define('Account', {
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
    comment: 'Hesap sahibi kullanıcı ID'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Hesap adı (örn: "Ziraat Bankası", "Nakit")'
  },
  type: {
    type: DataTypes.ENUM('cash', 'bank', 'credit_card', 'investment', 'open_account', 'other'),
    allowNull: false,
    defaultValue: 'cash',
    comment: 'Hesap tipi (cash: Nakit, bank: Banka, credit_card: Kredi Kartı, investment: Yatırım, open_account: Açık Hesap/KMH, other: Diğer)'
  },
  balance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    comment: 'Güncel bakiye'
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'TRY',
    comment: 'Para birimi'
  },
  color: {
    type: DataTypes.STRING(7),
    defaultValue: '#3B82F6',
    comment: 'Hesap rengi (hex kod)'
  },
  icon: {
    type: DataTypes.STRING(50),
    defaultValue: 'wallet',
    comment: 'Hesap ikonu'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Hesap açıklaması'
  },
  owner_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Hesap/Kart sahibinin adı)'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Hesap aktif mi?'
  },
  // Kredi kartı ve KMH için ek alanlar
  credit_limit: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    comment: 'Kredi kartı/KMH limiti'
  },
  billing_day: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 31
    },
    comment: 'Kredi kartı hesap kesim günü'
  },
  payment_day: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 31
    },
    comment: 'Kredi kartı ödeme günü'
  }
}, {
  tableName: 'accounts',
  timestamps: true
});

export default Account;


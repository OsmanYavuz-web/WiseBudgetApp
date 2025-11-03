import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Borç Modeli (Alacak/Verecek)
 * Kullanıcının alacak ve vereceklerini takip eder
 */
const Debt = sequelize.define('Debt', {
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
    comment: 'Borç sahibi kullanıcı ID'
  },
  person_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Kişi/Firma adı'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Telefon numarası'
  },
  type: {
    type: DataTypes.ENUM('receivable', 'payable'),
    allowNull: false,
    comment: 'receivable: Alacak (bana borçlu), payable: Verecek (ben borçlu)'
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    comment: 'Toplam borç tutarı'
  },
  paid_amount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    comment: 'Ödenen tutar'
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'TRY',
    comment: 'Para birimi'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Borç açıklaması'
  },
  debt_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Borç tarihi'
  },
  due_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Ödeme/Tahsil tarihi'
  },
  status: {
    type: DataTypes.ENUM('pending', 'partial', 'paid'),
    defaultValue: 'pending',
    comment: 'pending: Bekliyor, partial: Kısmi ödendi, paid: Tamamen ödendi'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Ek notlar'
  }
}, {
  tableName: 'debts',
  timestamps: true,
  indexes: [
    {
      fields: ['user_id', 'type']
    },
    {
      fields: ['status']
    },
    {
      fields: ['due_date']
    }
  ]
});

// Kalan borç hesaplama (virtual field)
Debt.prototype.getRemainingAmount = function() {
  return parseFloat(this.amount) - parseFloat(this.paid_amount);
};

// Ödeme yüzdesi hesaplama
Debt.prototype.getPaymentPercentage = function() {
  return (parseFloat(this.paid_amount) / parseFloat(this.amount)) * 100;
};

// Vade durumu kontrolü
Debt.prototype.isDueNear = function(daysThreshold = 7) {
  if (!this.due_date) return false;
  
  const now = new Date();
  const dueDate = new Date(this.due_date);
  const diffTime = dueDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= daysThreshold && diffDays >= 0;
};

// Vade geçmiş mi?
Debt.prototype.isOverdue = function() {
  if (!this.due_date) return false;
  
  const now = new Date();
  const dueDate = new Date(this.due_date);
  
  return now > dueDate && this.status !== 'paid';
};

export default Debt;


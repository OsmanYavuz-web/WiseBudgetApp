import User from './User.js';
import Account from './Account.js';
import Category from './Category.js';
import Transaction from './Transaction.js';
import Debt from './Debt.js';

/**
 * Model İlişkileri
 * Tüm veritabanı ilişkilerini burada tanımlıyoruz
 */

// User ilişkileri
User.hasMany(Account, { foreignKey: 'user_id', as: 'accounts', onDelete: 'CASCADE' });
User.hasMany(Category, { foreignKey: 'user_id', as: 'categories', onDelete: 'CASCADE' });
User.hasMany(Transaction, { foreignKey: 'user_id', as: 'transactions', onDelete: 'CASCADE' });
User.hasMany(Debt, { foreignKey: 'user_id', as: 'debts', onDelete: 'CASCADE' });

// Account ilişkileri
Account.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Account.hasMany(Transaction, { foreignKey: 'account_id', as: 'transactions', onDelete: 'RESTRICT' });
Account.hasMany(Transaction, { foreignKey: 'to_account_id', as: 'incoming_transfers', onDelete: 'RESTRICT' });

// Category ilişkileri
Category.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Category.hasMany(Transaction, { foreignKey: 'category_id', as: 'transactions', onDelete: 'RESTRICT' });

// Transaction ilişkileri
Transaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Transaction.belongsTo(Account, { foreignKey: 'account_id', as: 'account' });
Transaction.belongsTo(Account, { foreignKey: 'to_account_id', as: 'to_account' });
Transaction.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Transaction.belongsTo(Transaction, { foreignKey: 'parent_transaction_id', as: 'parent' });
Transaction.hasMany(Transaction, { foreignKey: 'parent_transaction_id', as: 'recurring_transactions' });

// Debt ilişkileri
Debt.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export {
  User,
  Account,
  Category,
  Transaction,
  Debt
};


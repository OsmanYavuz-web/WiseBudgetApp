import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';

/**
 * Kullanıcı Modeli
 * Uygulamayı kullanan kullanıcıların bilgilerini saklar
 */
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Kullanıcı adı'
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    },
    comment: 'E-posta adresi (benzersiz)'
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Şifrelenmiş parola'
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'TRY',
    comment: 'Varsayılan para birimi (TRY, USD, EUR vb.)'
  },
  language: {
    type: DataTypes.STRING(5),
    defaultValue: 'tr',
    comment: 'Dil tercihi'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Hesap aktif mi?'
  }
}, {
  tableName: 'users',
  timestamps: true
});

// Şifre kaydetmeden önce hash'le
User.beforeCreate(async (user) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Şifre güncellenirken hash'le
User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Şifre karşılaştırma metodu
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// JSON'a çevirirken şifreyi gizle
User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

export default User;


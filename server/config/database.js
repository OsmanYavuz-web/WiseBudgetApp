import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Veritabanı bağlantısı
const sequelize = new Sequelize(
  process.env.DB_NAME || 'wise_budget',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false, // SQL sorgularını konsola yazdırma (geliştirmede true yapabilirsiniz)
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true, // createdAt ve updatedAt otomatik ekler
      underscored: true // snake_case kullan
    }
  }
);

// Veritabanı bağlantısını test et
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Veritabanı bağlantısı başarılı!');
    return true;
  } catch (error) {
    console.error('❌ Veritabanı bağlantı hatası:', error.message);
    return false;
  }
};

// Veritabanı tablolarını senkronize et
export const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force }); // force: true tüm tabloları siler ve yeniden oluşturur
    console.log('✅ Veritabanı tabloları senkronize edildi!');
  } catch (error) {
    console.error('❌ Veritabanı senkronizasyon hatası:', error.message);
  }
};

export default sequelize;


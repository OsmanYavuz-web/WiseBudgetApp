import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize, { testConnection, syncDatabase } from './config/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Model imports - Tabloların oluşturulması için gerekli
import './models/index.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import debtRoutes from './routes/debtRoutes.js';

// Environment variables
dotenv.config();

// Express app oluştur
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Ana route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Wise Budget API - Gelir Gider Takip Uygulaması',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      accounts: '/api/accounts',
      categories: '/api/categories',
      transactions: '/api/transactions',
      debts: '/api/debts'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/debts', debtRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Port
const PORT = process.env.PORT || 5000;

// Sunucuyu başlat
const startServer = async () => {
  try {
    // Veritabanı bağlantısını test et
    const connected = await testConnection();
    
    if (!connected) {
      console.error('❌ Veritabanı bağlantısı kurulamadı. Lütfen MySQL ayarlarınızı kontrol edin.');
      process.exit(1);
    }

    // Veritabanı tablolarını senkronize et (geliştirme ortamında veya tablolar yoksa)
    // force: false = mevcut tabloları silmez, sadece yoksa oluşturur
    await syncDatabase(false);

    // Sunucuyu dinlemeye başla
    app.listen(PORT, () => {
      console.log(`\n🚀 Server ${PORT} portunda çalışıyor`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 API: http://localhost:${PORT}`);
      console.log(`💾 Database: ${process.env.DB_NAME}`);
      console.log('\n✅ Hazır! API isteklerini kabul ediyor.\n');
    });
  } catch (error) {
    console.error('❌ Sunucu başlatma hatası:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n⚠️  SIGTERM sinyali alındı. Sunucu kapatılıyor...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n⚠️  SIGINT sinyali alındı. Sunucu kapatılıyor...');
  await sequelize.close();
  process.exit(0);
});

// Sunucuyu başlat
startServer();

export default app;


import sequelize from '../config/database.js';
import { Category } from '../models/index.js';

/**
 * Varsayılan Sistem Kategorilerini Oluştur
 * Bu script ile veritabanına başlangıç kategorileri eklenir
 */

const expenseCategories = [
  { name: 'Gıda & Market', icon: 'shopping-cart', color: '#EF4444' },
  { name: 'Ulaşım', icon: 'car', color: '#F59E0B' },
  { name: 'Faturalar', icon: 'file-text', color: '#10B981' },
  { name: 'Kira', icon: 'home', color: '#3B82F6' },
  { name: 'Sağlık', icon: 'heart', color: '#EC4899' },
  { name: 'Eğitim', icon: 'book', color: '#8B5CF6' },
  { name: 'Eğlence', icon: 'film', color: '#F97316' },
  { name: 'Giyim', icon: 'shopping-bag', color: '#06B6D4' },
  { name: 'Teknoloji', icon: 'smartphone', color: '#6366F1' },
  { name: 'Spor', icon: 'activity', color: '#14B8A6' },
  { name: 'Seyahat', icon: 'map', color: '#F43F5E' },
  { name: 'Restoran & Cafe', icon: 'coffee', color: '#A855F7' },
  { name: 'Alışveriş', icon: 'gift', color: '#EC4899' },
  { name: 'Sigorta', icon: 'shield', color: '#6B7280' },
  { name: 'Kredi Kartı', icon: 'credit-card', color: '#DC2626' },
  { name: 'Diğer Giderler', icon: 'more-horizontal', color: '#9CA3AF' }
];

const incomeCategories = [
  { name: 'Maaş', icon: 'dollar-sign', color: '#10B981' },
  { name: 'Freelance', icon: 'briefcase', color: '#3B82F6' },
  { name: 'Yatırım Geliri', icon: 'trending-up', color: '#8B5CF6' },
  { name: 'Kira Geliri', icon: 'home', color: '#F59E0B' },
  { name: 'İkramiye', icon: 'award', color: '#EC4899' },
  { name: 'Hediye', icon: 'gift', color: '#F43F5E' },
  { name: 'Satış', icon: 'tag', color: '#06B6D4' },
  { name: 'Diğer Gelirler', icon: 'plus-circle', color: '#10B981' }
];

const seedCategories = async () => {
  try {
    console.log('🌱 Kategori seed işlemi başlıyor...');

    // Veritabanı bağlantısını test et
    await sequelize.authenticate();
    console.log('✅ Veritabanı bağlantısı başarılı');

    // Tabloları oluştur (eğer yoksa)
    await sequelize.sync({ alter: false });
    console.log('✅ Veritabanı tabloları hazır');

    // Mevcut sistem kategorilerini kontrol et
    const existingCount = await Category.count({
      where: { is_system: true }
    });

    if (existingCount > 0) {
      console.log(`⚠️  Zaten ${existingCount} sistem kategorisi mevcut. Seed atlanıyor.`);
      console.log('💡 Kategorileri sıfırlamak için önce veritabanını temizleyin.');
      process.exit(0);
    }

    // Gider kategorilerini ekle
    console.log('📝 Gider kategorileri ekleniyor...');
    for (const cat of expenseCategories) {
      await Category.create({
        ...cat,
        type: 'expense',
        is_system: true,
        user_id: null
      });
    }
    console.log(`✅ ${expenseCategories.length} gider kategorisi eklendi`);

    // Gelir kategorilerini ekle
    console.log('📝 Gelir kategorileri ekleniyor...');
    for (const cat of incomeCategories) {
      await Category.create({
        ...cat,
        type: 'income',
        is_system: true,
        user_id: null
      });
    }
    console.log(`✅ ${incomeCategories.length} gelir kategorisi eklendi`);

    console.log('\n🎉 Kategori seed işlemi tamamlandı!');
    console.log(`📊 Toplam ${expenseCategories.length + incomeCategories.length} kategori eklendi\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed hatası:', error);
    process.exit(1);
  }
};

// Script'i çalıştır
seedCategories();


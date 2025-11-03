import { User } from '../models/index.js';
import { generateToken } from '../middleware/auth.js';

/**
 * Kullanıcı Kaydı
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, currency, language } = req.body;

    // Email kontrolü
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Bu e-posta adresi zaten kayıtlı'
      });
    }

    // Yeni kullanıcı oluştur
    const user = await User.create({
      name,
      email,
      password,
      currency: currency || 'TRY',
      language: language || 'tr'
    });

    // Token oluştur
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Kayıt başarılı',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kayıt sırasında hata oluştu',
      error: error.message
    });
  }
};

/**
 * Kullanıcı Girişi
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Email ve şifre kontrolü
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'E-posta ve şifre gerekli'
      });
    }

    // Kullanıcıyı bul (şifre dahil)
    const user = await User.findOne({ 
      where: { email },
      attributes: { include: ['password'] }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz e-posta veya şifre'
      });
    }

    // Şifre kontrolü
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz e-posta veya şifre'
      });
    }

    // Hesap aktif mi kontrol et
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Hesabınız devre dışı bırakılmış'
      });
    }

    // Token oluştur
    const token = generateToken(user.id);

    // Şifreyi response'dan çıkar
    const userResponse = user.toJSON();

    res.status(200).json({
      success: true,
      message: 'Giriş başarılı',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Giriş sırasında hata oluştu',
      error: error.message
    });
  }
};

/**
 * Mevcut Kullanıcı Bilgilerini Getir
 * GET /api/auth/me
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kullanıcı bilgileri alınamadı',
      error: error.message
    });
  }
};

/**
 * Kullanıcı Bilgilerini Güncelle
 * PUT /api/auth/update
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, currency, language } = req.body;
    const user = await User.findByPk(req.user.id);

    if (name) user.name = name;
    if (currency) user.currency = currency;
    if (language) user.language = language;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profil güncellendi',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Profil güncellenemedi',
      error: error.message
    });
  }
};

/**
 * Şifre Değiştir
 * PUT /api/auth/change-password
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Kullanıcıyı şifresiyle birlikte getir
    const user = await User.findByPk(req.user.id, {
      attributes: { include: ['password'] }
    });

    // Mevcut şifreyi kontrol et
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Mevcut şifre yanlış'
      });
    }

    // Yeni şifreyi kaydet
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Şifre başarıyla değiştirildi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Şifre değiştirilemedi',
      error: error.message
    });
  }
};


import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

/**
 * JWT Token Doğrulama Middleware
 * Korumalı route'lar için kullanıcı kimlik doğrulaması yapar
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // Token'ı header'dan al
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Token yoksa hata döndür
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Bu işlem için giriş yapmanız gerekiyor'
      });
    }

    try {
      // Token'ı doğrula
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Kullanıcıyı veritabanından al
      const user = await User.findByPk(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Kullanıcı bulunamadı'
        });
      }

      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'Hesabınız devre dışı bırakılmış'
        });
      }

      // Kullanıcıyı request'e ekle
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz veya süresi dolmuş token'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Kimlik doğrulama hatası',
      error: error.message
    });
  }
};

/**
 * JWT Token Oluşturma Yardımcı Fonksiyonu
 */
export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};


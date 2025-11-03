import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validator.js';
import { protect } from '../middleware/auth.js';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
} from '../controllers/authController.js';

const router = express.Router();

/**
 * Kullanıcı Kaydı
 * POST /api/auth/register
 */
router.post(
  '/register',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('İsim gerekli')
      .isLength({ min: 2, max: 100 })
      .withMessage('İsim 2-100 karakter arasında olmalı'),
    body('email')
      .trim()
      .notEmpty()
      .withMessage('E-posta gerekli')
      .isEmail()
      .withMessage('Geçerli bir e-posta adresi girin')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Şifre gerekli')
      .isLength({ min: 6 })
      .withMessage('Şifre en az 6 karakter olmalı'),
    validate
  ],
  register
);

/**
 * Kullanıcı Girişi
 * POST /api/auth/login
 */
router.post(
  '/login',
  [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('E-posta gerekli')
      .isEmail()
      .withMessage('Geçerli bir e-posta adresi girin')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Şifre gerekli'),
    validate
  ],
  login
);

/**
 * Mevcut Kullanıcı Bilgilerini Getir
 * GET /api/auth/me
 */
router.get('/me', protect, getMe);

/**
 * Kullanıcı Bilgilerini Güncelle
 * PUT /api/auth/update
 */
router.put(
  '/update',
  protect,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('İsim 2-100 karakter arasında olmalı'),
    body('currency')
      .optional()
      .isLength({ min: 3, max: 3 })
      .withMessage('Para birimi 3 karakter olmalı (örn: TRY, USD)'),
    body('language')
      .optional()
      .isLength({ min: 2, max: 5 })
      .withMessage('Dil kodu 2-5 karakter olmalı'),
    validate
  ],
  updateProfile
);

/**
 * Şifre Değiştir
 * PUT /api/auth/change-password
 */
router.put(
  '/change-password',
  protect,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Mevcut şifre gerekli'),
    body('newPassword')
      .notEmpty()
      .withMessage('Yeni şifre gerekli')
      .isLength({ min: 6 })
      .withMessage('Yeni şifre en az 6 karakter olmalı'),
    validate
  ],
  changePassword
);

export default router;


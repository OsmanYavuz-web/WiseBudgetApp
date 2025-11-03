import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validator.js';
import { protect } from '../middleware/auth.js';
import {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountSummary
} from '../controllers/accountController.js';

const router = express.Router();

// Tüm route'lar korumalı
router.use(protect);

/**
 * Hesap Listesi ve Yeni Hesap Oluşturma
 */
router
  .route('/')
  .get(getAccounts)
  .post(
    [
      body('name')
        .trim()
        .notEmpty()
        .withMessage('Hesap adı gerekli')
        .isLength({ max: 100 })
        .withMessage('Hesap adı en fazla 100 karakter olabilir'),
      body('type')
        .notEmpty()
        .withMessage('Hesap tipi gerekli')
        .isIn(['cash', 'bank', 'credit_card', 'investment', 'open_account', 'other'])
        .withMessage('Geçersiz hesap tipi'),
      body('balance')
        .optional()
        .isDecimal()
        .withMessage('Bakiye sayısal olmalı'),
      body('currency')
        .optional()
        .isLength({ min: 3, max: 3 })
        .withMessage('Para birimi 3 karakter olmalı'),
      body('color')
        .optional()
        .matches(/^#[0-9A-F]{6}$/i)
        .withMessage('Geçerli bir hex renk kodu girin'),
      body('credit_limit')
        .optional()
        .isDecimal()
        .withMessage('Kredi limiti sayısal olmalı'),
      body('billing_day')
        .optional()
        .isInt({ min: 1, max: 31 })
        .withMessage('Hesap kesim günü 1-31 arası olmalı'),
      body('payment_day')
        .optional()
        .isInt({ min: 1, max: 31 })
        .withMessage('Ödeme günü 1-31 arası olmalı'),
      validate
    ],
    createAccount
  );

/**
 * Tek Hesap İşlemleri
 */
router
  .route('/:id')
  .get(getAccount)
  .put(
    [
      body('name')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Hesap adı en fazla 100 karakter olabilir'),
      body('type')
        .optional()
        .isIn(['cash', 'bank', 'credit_card', 'investment', 'open_account', 'other'])
        .withMessage('Geçersiz hesap tipi'),
      body('color')
        .optional()
        .matches(/^#[0-9A-F]{6}$/i)
        .withMessage('Geçerli bir hex renk kodu girin'),
      validate
    ],
    updateAccount
  )
  .delete(deleteAccount);

/**
 * Hesap Özeti
 */
router.get('/:id/summary', getAccountSummary);

export default router;


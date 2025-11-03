import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validator.js';
import { protect } from '../middleware/auth.js';
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction
} from '../controllers/transactionController.js';

const router = express.Router();

// Tüm route'lar korumalı
router.use(protect);

/**
 * İşlem Listesi ve Yeni İşlem Oluşturma
 */
router
  .route('/')
  .get(getTransactions)
  .post(
    [
      body('account_id')
        .notEmpty()
        .withMessage('Hesap ID gerekli')
        .isInt()
        .withMessage('Geçerli bir hesap ID girin'),
      body('category_id')
        .notEmpty()
        .withMessage('Kategori ID gerekli')
        .isInt()
        .withMessage('Geçerli bir kategori ID girin'),
      body('type')
        .optional()
        .isIn(['income', 'expense', 'transfer'])
        .withMessage('Geçersiz işlem tipi'),
      body('amount')
        .notEmpty()
        .withMessage('Tutar gerekli')
        .isDecimal({ decimal_digits: '0,2' })
        .withMessage('Geçerli bir tutar girin')
        .custom((value) => {
          if (parseFloat(value) <= 0) {
            throw new Error('Tutar 0\'dan büyük olmalı');
          }
          return true;
        }),
      body('currency')
        .optional()
        .isLength({ min: 3, max: 3 })
        .withMessage('Para birimi 3 karakter olmalı'),
      body('transaction_date')
        .optional()
        .isISO8601()
        .withMessage('Geçerli bir tarih girin'),
      body('to_account_id')
        .optional()
        .isInt()
        .withMessage('Geçerli bir hedef hesap ID girin'),
      body('is_recurring')
        .optional()
        .isBoolean()
        .withMessage('is_recurring boolean olmalı'),
      body('recurring_type')
        .optional()
        .isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'])
        .withMessage('Geçersiz tekrarlama tipi'),
      validate
    ],
    createTransaction
  );

/**
 * Tek İşlem İşlemleri
 */
router
  .route('/:id')
  .get(getTransaction)
  .put(
    [
      body('account_id')
        .optional()
        .isInt()
        .withMessage('Geçerli bir hesap ID girin'),
      body('category_id')
        .optional()
        .isInt()
        .withMessage('Geçerli bir kategori ID girin'),
      body('amount')
        .optional()
        .isDecimal({ decimal_digits: '0,2' })
        .withMessage('Geçerli bir tutar girin')
        .custom((value) => {
          if (value && parseFloat(value) <= 0) {
            throw new Error('Tutar 0\'dan büyük olmalı');
          }
          return true;
        }),
      body('transaction_date')
        .optional()
        .isISO8601()
        .withMessage('Geçerli bir tarih girin'),
      validate
    ],
    updateTransaction
  )
  .delete(deleteTransaction);

export default router;


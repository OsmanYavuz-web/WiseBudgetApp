import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validator.js';
import { protect } from '../middleware/auth.js';
import {
  getDebts,
  getDebtsSummary,
  getDebt,
  createDebt,
  updateDebt,
  makePayment,
  deleteDebt
} from '../controllers/debtController.js';

const router = express.Router();

// Tüm route'lar korumalı
router.use(protect);

/**
 * Borç Özeti
 * GET /api/debts/summary
 */
router.get('/summary', getDebtsSummary);

/**
 * Borç Listesi ve Yeni Borç Oluşturma
 */
router
  .route('/')
  .get(getDebts)
  .post(
    [
      body('person_name')
        .trim()
        .notEmpty()
        .withMessage('Kişi/Firma adı gerekli')
        .isLength({ max: 100 })
        .withMessage('İsim en fazla 100 karakter olabilir'),
      body('type')
        .notEmpty()
        .withMessage('Borç tipi gerekli')
        .isIn(['receivable', 'payable'])
        .withMessage('Geçersiz borç tipi (receivable veya payable)'),
      body('amount')
        .notEmpty()
        .withMessage('Tutar gerekli')
        .isDecimal()
        .withMessage('Geçerli bir tutar girin')
        .custom((value) => {
          if (parseFloat(value) <= 0) {
            throw new Error('Tutar 0\'dan büyük olmalı');
          }
          return true;
        }),
      body('debt_date')
        .optional()
        .isISO8601()
        .withMessage('Geçerli bir tarih girin'),
      body('due_date')
        .optional()
        .isISO8601()
        .withMessage('Geçerli bir vade tarihi girin'),
      validate
    ],
    createDebt
  );

/**
 * Tek Borç İşlemleri
 */
router
  .route('/:id')
  .get(getDebt)
  .put(
    [
      body('amount')
        .optional()
        .isDecimal()
        .withMessage('Geçerli bir tutar girin'),
      body('paid_amount')
        .optional()
        .isDecimal()
        .withMessage('Geçerli bir ödeme tutarı girin'),
      validate
    ],
    updateDebt
  )
  .delete(deleteDebt);

/**
 * Ödeme Yap / Tahsil Et
 * POST /api/debts/:id/payment
 */
router.post(
  '/:id/payment',
  [
    body('payment_amount')
      .notEmpty()
      .withMessage('Ödeme tutarı gerekli')
      .isDecimal()
      .withMessage('Geçerli bir tutar girin')
      .custom((value) => {
        if (parseFloat(value) <= 0) {
          throw new Error('Ödeme tutarı 0\'dan büyük olmalı');
        }
        return true;
      }),
    validate
  ],
  makePayment
);

export default router;


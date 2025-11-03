import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validator.js';
import { protect } from '../middleware/auth.js';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';

const router = express.Router();

// Tüm route'lar korumalı
router.use(protect);

/**
 * Kategori Listesi ve Yeni Kategori Oluşturma
 */
router
  .route('/')
  .get(getCategories)
  .post(
    [
      body('name')
        .trim()
        .notEmpty()
        .withMessage('Kategori adı gerekli')
        .isLength({ max: 100 })
        .withMessage('Kategori adı en fazla 100 karakter olabilir'),
      body('type')
        .notEmpty()
        .withMessage('Kategori tipi gerekli')
        .isIn(['income', 'expense'])
        .withMessage('Geçersiz kategori tipi'),
      body('color')
        .optional()
        .matches(/^#[0-9A-F]{6}$/i)
        .withMessage('Geçerli bir hex renk kodu girin'),
      validate
    ],
    createCategory
  );

/**
 * Tek Kategori İşlemleri
 */
router
  .route('/:id')
  .get(getCategory)
  .put(
    [
      body('name')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Kategori adı en fazla 100 karakter olabilir'),
      body('type')
        .optional()
        .isIn(['income', 'expense'])
        .withMessage('Geçersiz kategori tipi'),
      body('color')
        .optional()
        .matches(/^#[0-9A-F]{6}$/i)
        .withMessage('Geçerli bir hex renk kodu girin'),
      validate
    ],
    updateCategory
  )
  .delete(deleteCategory);

export default router;


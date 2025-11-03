import { Category } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Tüm Kategorileri Getir
 * GET /api/categories
 */
export const getCategories = async (req, res) => {
  try {
    const { type } = req.query;
    
    const where = {
      [Op.or]: [
        { user_id: req.user.id },
        { is_system: true }
      ]
    };
    
    if (type) where.type = type;

    const categories = await Category.findAll({
      where,
      order: [['is_system', 'DESC'], ['name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kategoriler getirilemedi',
      error: error.message
    });
  }
};

/**
 * Tek Kategori Getir
 * GET /api/categories/:id
 */
export const getCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      where: {
        id: req.params.id,
        [Op.or]: [
          { user_id: req.user.id },
          { is_system: true }
        ]
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kategori getirilemedi',
      error: error.message
    });
  }
};

/**
 * Yeni Kategori Oluştur
 * POST /api/categories
 */
export const createCategory = async (req, res) => {
  try {
    const categoryData = {
      ...req.body,
      user_id: req.user.id,
      is_system: false
    };

    const category = await Category.create(categoryData);

    res.status(201).json({
      success: true,
      message: 'Kategori oluşturuldu',
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kategori oluşturulamadı',
      error: error.message
    });
  }
};

/**
 * Kategori Güncelle
 * PUT /api/categories/:id
 */
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id,
        is_system: false
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı veya sistem kategorisi'
      });
    }

    await category.update(req.body);

    res.status(200).json({
      success: true,
      message: 'Kategori güncellendi',
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kategori güncellenemedi',
      error: error.message
    });
  }
};

/**
 * Kategori Sil
 * DELETE /api/categories/:id
 */
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id,
        is_system: false
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı veya sistem kategorisi'
      });
    }

    await category.destroy();

    res.status(200).json({
      success: true,
      message: 'Kategori silindi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kategori silinemedi',
      error: error.message
    });
  }
};


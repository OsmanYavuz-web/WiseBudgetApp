import { Transaction, Account, Category } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Tüm İşlemleri Getir
 * GET /api/transactions
 */
export const getTransactions = async (req, res) => {
  try {
    const {
      type,
      account_id,
      category_id,
      start_date,
      end_date,
      page = 1,
      limit = 50
    } = req.query;

    const where = { user_id: req.user.id };

    if (type) where.type = type;
    if (account_id) where.account_id = account_id;
    if (category_id) where.category_id = category_id;

    if (start_date || end_date) {
      where.transaction_date = {};
      if (start_date) where.transaction_date[Op.gte] = new Date(start_date);
      if (end_date) where.transaction_date[Op.lte] = new Date(end_date);
    }

    const offset = (page - 1) * limit;

    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where,
      include: [
        {
          model: Account,
          as: 'account',
          attributes: ['id', 'name', 'type', 'color', 'icon']
        },
        {
          model: Account,
          as: 'to_account',
          attributes: ['id', 'name', 'type', 'color', 'icon']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'type', 'color', 'icon']
        }
      ],
      order: [['transaction_date', 'DESC'], ['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      success: true,
      count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      data: transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'İşlemler getirilemedi',
      error: error.message
    });
  }
};

/**
 * Tek İşlem Getir
 * GET /api/transactions/:id
 */
export const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      },
      include: [
        {
          model: Account,
          as: 'account',
          attributes: ['id', 'name', 'type', 'color', 'icon']
        },
        {
          model: Account,
          as: 'to_account',
          attributes: ['id', 'name', 'type', 'color', 'icon']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'type', 'color', 'icon']
        }
      ]
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'İşlem bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'İşlem getirilemedi',
      error: error.message
    });
  }
};

/**
 * Yeni İşlem Oluştur
 * POST /api/transactions
 */
export const createTransaction = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const transactionData = {
      ...req.body,
      user_id: req.user.id
    };

    // Hesabı kontrol et
    const account = await Account.findOne({
      where: {
        id: transactionData.account_id,
        user_id: req.user.id
      }
    });

    if (!account) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Hesap bulunamadı'
      });
    }

    // Kategoriyi kontrol et
    const category = await Category.findOne({
      where: {
        id: transactionData.category_id,
        [Op.or]: [
          { user_id: req.user.id },
          { is_system: true }
        ]
      }
    });

    if (!category) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı'
      });
    }

    // İşlem tipini kategori tipine göre ayarla (eğer belirtilmemişse)
    if (!transactionData.type) {
      transactionData.type = category.type;
    }

    // Transfer işlemi için hedef hesabı kontrol et
    if (transactionData.type === 'transfer') {
      if (!transactionData.to_account_id) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: 'Transfer için hedef hesap gerekli'
        });
      }

      const toAccount = await Account.findOne({
        where: {
          id: transactionData.to_account_id,
          user_id: req.user.id
        }
      });

      if (!toAccount) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: 'Hedef hesap bulunamadı'
        });
      }

      // Transfer: kaynak hesaptan düş
      account.balance = parseFloat(account.balance) - parseFloat(transactionData.amount);
      await account.save({ transaction: t });

      // Transfer: hedef hesaba ekle
      toAccount.balance = parseFloat(toAccount.balance) + parseFloat(transactionData.amount);
      await toAccount.save({ transaction: t });
    } else {
      // Normal işlem: hesap bakiyesini güncelle
      if (transactionData.type === 'income') {
        // Gelir: Kredi kartına ödeme yapıldıysa borç azalır (bakiye artar)
        account.balance = parseFloat(account.balance) + parseFloat(transactionData.amount);
      } else if (transactionData.type === 'expense') {
        // Gider: Kredi kartıyla harcama yapıldıysa borç artar (bakiye azalır)
        account.balance = parseFloat(account.balance) - parseFloat(transactionData.amount);
        
        // Kredi kartı ve KMH limit kontrolü
        if ((account.type === 'credit_card' || account.type === 'open_account') && account.credit_limit) {
          const usedCredit = Math.abs(parseFloat(account.balance));
          if (usedCredit > parseFloat(account.credit_limit)) {
            await t.rollback();
            const accountTypeName = account.type === 'credit_card' ? 'Kredi kartı' : 'KMH';
            return res.status(400).json({
              success: false,
              message: `${accountTypeName} limiti aşıldı! Limit: ${account.credit_limit} TL, Kullanılan: ${usedCredit} TL`
            });
          }
        }
      }
      await account.save({ transaction: t });
    }

    // İşlemi oluştur
    const newTransaction = await Transaction.create(transactionData, { transaction: t });

    await t.commit();

    // İşlemi ilişkilerle birlikte getir
    const transaction = await Transaction.findByPk(newTransaction.id, {
      include: [
        {
          model: Account,
          as: 'account',
          attributes: ['id', 'name', 'type', 'color', 'icon']
        },
        {
          model: Account,
          as: 'to_account',
          attributes: ['id', 'name', 'type', 'color', 'icon']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'type', 'color', 'icon']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'İşlem oluşturuldu',
      data: transaction
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      success: false,
      message: 'İşlem oluşturulamadı',
      error: error.message
    });
  }
};

/**
 * İşlem Güncelle
 * PUT /api/transactions/:id
 */
export const updateTransaction = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const transaction = await Transaction.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!transaction) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'İşlem bulunamadı'
      });
    }

    // Eski işlemi geri al (bakiyeyi düzelt)
    const oldAccount = await Account.findByPk(transaction.account_id);
    
    if (transaction.type === 'income') {
      oldAccount.balance = parseFloat(oldAccount.balance) - parseFloat(transaction.amount);
    } else if (transaction.type === 'expense') {
      oldAccount.balance = parseFloat(oldAccount.balance) + parseFloat(transaction.amount);
    } else if (transaction.type === 'transfer' && transaction.to_account_id) {
      oldAccount.balance = parseFloat(oldAccount.balance) + parseFloat(transaction.amount);
      const oldToAccount = await Account.findByPk(transaction.to_account_id);
      oldToAccount.balance = parseFloat(oldToAccount.balance) - parseFloat(transaction.amount);
      await oldToAccount.save({ transaction: t });
    }
    await oldAccount.save({ transaction: t });

    // İşlemi güncelle
    await transaction.update(req.body, { transaction: t });

    // Yeni işlemi uygula (bakiyeyi güncelle)
    const newAccount = await Account.findByPk(transaction.account_id);
    
    if (transaction.type === 'income') {
      newAccount.balance = parseFloat(newAccount.balance) + parseFloat(transaction.amount);
    } else if (transaction.type === 'expense') {
      newAccount.balance = parseFloat(newAccount.balance) - parseFloat(transaction.amount);
    } else if (transaction.type === 'transfer' && transaction.to_account_id) {
      newAccount.balance = parseFloat(newAccount.balance) - parseFloat(transaction.amount);
      const newToAccount = await Account.findByPk(transaction.to_account_id);
      newToAccount.balance = parseFloat(newToAccount.balance) + parseFloat(transaction.amount);
      await newToAccount.save({ transaction: t });
    }
    await newAccount.save({ transaction: t });

    await t.commit();

    // Güncellenmiş işlemi getir
    const updatedTransaction = await Transaction.findByPk(transaction.id, {
      include: [
        {
          model: Account,
          as: 'account',
          attributes: ['id', 'name', 'type', 'color', 'icon']
        },
        {
          model: Account,
          as: 'to_account',
          attributes: ['id', 'name', 'type', 'color', 'icon']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'type', 'color', 'icon']
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'İşlem güncellendi',
      data: updatedTransaction
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      success: false,
      message: 'İşlem güncellenemedi',
      error: error.message
    });
  }
};

/**
 * İşlem Sil
 * DELETE /api/transactions/:id
 */
export const deleteTransaction = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const transaction = await Transaction.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!transaction) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'İşlem bulunamadı'
      });
    }

    // İşlemi geri al (bakiyeyi düzelt)
    const account = await Account.findByPk(transaction.account_id);
    
    if (transaction.type === 'income') {
      account.balance = parseFloat(account.balance) - parseFloat(transaction.amount);
    } else if (transaction.type === 'expense') {
      account.balance = parseFloat(account.balance) + parseFloat(transaction.amount);
    } else if (transaction.type === 'transfer' && transaction.to_account_id) {
      account.balance = parseFloat(account.balance) + parseFloat(transaction.amount);
      const toAccount = await Account.findByPk(transaction.to_account_id);
      toAccount.balance = parseFloat(toAccount.balance) - parseFloat(transaction.amount);
      await toAccount.save({ transaction: t });
    }
    await account.save({ transaction: t });

    // İşlemi sil
    await transaction.destroy({ transaction: t });

    await t.commit();

    res.status(200).json({
      success: true,
      message: 'İşlem silindi'
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      success: false,
      message: 'İşlem silinemedi',
      error: error.message
    });
  }
};


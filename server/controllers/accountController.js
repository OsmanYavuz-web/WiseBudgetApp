import { Account, Transaction } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Tüm Hesapları Getir
 * GET /api/accounts
 */
export const getAccounts = async (req, res) => {
  try {
    const { type, is_active } = req.query;
    
    const where = { user_id: req.user.id };
    
    if (type) where.type = type;
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const accounts = await Account.findAll({
      where,
      order: [['created_at', 'DESC']]
    });

    // Kredi kartları ve KMH için ek bilgileri ekle
    const accountsWithDetails = accounts.map(account => {
      const accountData = account.toJSON();
      
      if ((account.type === 'credit_card' || account.type === 'open_account') && account.credit_limit) {
        const usedCredit = Math.abs(parseFloat(account.balance));
        accountData.used_credit = usedCredit;
        accountData.available_credit = parseFloat(account.credit_limit) - usedCredit;
        accountData.usage_percentage = (usedCredit / parseFloat(account.credit_limit)) * 100;
      }
      
      return accountData;
    });

    res.status(200).json({
      success: true,
      count: accountsWithDetails.length,
      data: accountsWithDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Hesaplar getirilemedi',
      error: error.message
    });
  }
};

/**
 * Tek Hesap Getir
 * GET /api/accounts/:id
 */
export const getAccount = async (req, res) => {
  try {
    const account = await Account.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Hesap bulunamadı'
      });
    }

    const accountData = account.toJSON();

    // Kredi kartı ve KMH için ek bilgiler
    if ((account.type === 'credit_card' || account.type === 'open_account') && account.credit_limit) {
      const usedCredit = Math.abs(parseFloat(account.balance));
      accountData.used_credit = usedCredit;
      accountData.available_credit = parseFloat(account.credit_limit) - usedCredit;
      accountData.usage_percentage = (usedCredit / parseFloat(account.credit_limit)) * 100;
    }

    res.status(200).json({
      success: true,
      data: accountData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Hesap getirilemedi',
      error: error.message
    });
  }
};

/**
 * Yeni Hesap Oluştur
 * POST /api/accounts
 */
export const createAccount = async (req, res) => {
  try {
    const accountData = {
      ...req.body,
      user_id: req.user.id
    };

    console.log('Creating account with data:', accountData);

    const account = await Account.create(accountData);

    res.status(201).json({
      success: true,
      message: 'Hesap oluşturuldu',
      data: account
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Hesap oluşturulamadı',
      error: error.message
    });
  }
};

/**
 * Hesap Güncelle
 * PUT /api/accounts/:id
 */
export const updateAccount = async (req, res) => {
  try {
    const account = await Account.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Hesap bulunamadı'
      });
    }

    // Bakiye sadece hesap ilk oluşturulurken ayarlanabilir
    // Daha sonra sadece işlemlerle değişir
    const { balance, ...updateData } = req.body;

    await account.update(updateData);

    res.status(200).json({
      success: true,
      message: 'Hesap güncellendi',
      data: account
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Hesap güncellenemedi',
      error: error.message
    });
  }
};

/**
 * Hesap Sil
 * DELETE /api/accounts/:id
 */
export const deleteAccount = async (req, res) => {
  try {
    const account = await Account.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Hesap bulunamadı'
      });
    }

    // Hesaba bağlı işlem var mı kontrol et
    const transactionCount = await Transaction.count({
      where: {
        [Op.or]: [
          { account_id: account.id },
          { to_account_id: account.id }
        ]
      }
    });

    if (transactionCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bu hesaba ait işlemler mevcut. Önce işlemleri silmelisiniz.'
      });
    }

    await account.destroy();

    res.status(200).json({
      success: true,
      message: 'Hesap silindi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Hesap silinemedi',
      error: error.message
    });
  }
};

/**
 * Hesap Özeti
 * GET /api/accounts/:id/summary
 */
export const getAccountSummary = async (req, res) => {
  try {
    const account = await Account.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Hesap bulunamadı'
      });
    }

    // Son 30 günün işlemleri
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const transactions = await Transaction.findAll({
      where: {
        account_id: account.id,
        transaction_date: {
          [Op.gte]: thirtyDaysAgo
        }
      },
      order: [['transaction_date', 'DESC']],
      limit: 10
    });

    // Toplam gelir ve gider
    const income = await Transaction.sum('amount', {
      where: {
        account_id: account.id,
        type: 'income',
        transaction_date: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    }) || 0;

    const expense = await Transaction.sum('amount', {
      where: {
        account_id: account.id,
        type: 'expense',
        transaction_date: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    }) || 0;

    res.status(200).json({
      success: true,
      data: {
        account,
        summary: {
          last_30_days: {
            income,
            expense,
            net: income - expense
          },
          recent_transactions: transactions
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Hesap özeti getirilemedi',
      error: error.message
    });
  }
};


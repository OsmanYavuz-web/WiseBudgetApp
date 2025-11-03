import { Debt } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Tüm Borçları Getir (Alacak/Verecek)
 * GET /api/debts
 */
export const getDebts = async (req, res) => {
  try {
    const { type, status } = req.query;
    
    const where = { user_id: req.user.id };
    
    if (type) where.type = type;
    if (status) where.status = status;

    const debts = await Debt.findAll({
      where,
      order: [
        ['status', 'ASC'], // Önce bekleyenler
        ['due_date', 'ASC'], // Sonra vade tarihine göre
        ['created_at', 'DESC']
      ]
    });

    // Her borç için ek bilgileri hesapla
    const debtsWithDetails = debts.map(debt => {
      const debtObj = debt.toJSON();
      debtObj.remaining_amount = debt.getRemainingAmount();
      debtObj.payment_percentage = debt.getPaymentPercentage();
      debtObj.is_due_near = debt.isDueNear();
      debtObj.is_overdue = debt.isOverdue();
      return debtObj;
    });

    res.status(200).json({
      success: true,
      count: debtsWithDetails.length,
      data: debtsWithDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Borçlar getirilemedi',
      error: error.message
    });
  }
};

/**
 * Borç Özeti
 * GET /api/debts/summary
 */
export const getDebtsSummary = async (req, res) => {
  try {
    // Alacaklar (Bana borçlu)
    const receivables = await Debt.findAll({
      where: {
        user_id: req.user.id,
        type: 'receivable'
      }
    });

    const totalReceivable = receivables.reduce((sum, debt) => 
      sum + debt.getRemainingAmount(), 0
    );

    const receivablePending = receivables.filter(d => d.status === 'pending').length;
    const receivableOverdue = receivables.filter(d => d.isOverdue()).length;

    // Verecekler (Ben borçlu)
    const payables = await Debt.findAll({
      where: {
        user_id: req.user.id,
        type: 'payable'
      }
    });

    const totalPayable = payables.reduce((sum, debt) => 
      sum + debt.getRemainingAmount(), 0
    );

    const payablePending = payables.filter(d => d.status === 'pending').length;
    const payableOverdue = payables.filter(d => d.isOverdue()).length;
    const payableDueNear = payables.filter(d => d.isDueNear()).length;

    res.status(200).json({
      success: true,
      data: {
        receivables: {
          total: parseFloat(totalReceivable),
          count: receivables.length,
          pending: receivablePending,
          overdue: receivableOverdue
        },
        payables: {
          total: parseFloat(totalPayable),
          count: payables.length,
          pending: payablePending,
          overdue: payableOverdue,
          due_near: payableDueNear
        },
        net_balance: parseFloat(totalReceivable - totalPayable)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Borç özeti getirilemedi',
      error: error.message
    });
  }
};

/**
 * Tek Borç Getir
 * GET /api/debts/:id
 */
export const getDebt = async (req, res) => {
  try {
    const debt = await Debt.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!debt) {
      return res.status(404).json({
        success: false,
        message: 'Borç bulunamadı'
      });
    }

    const debtObj = debt.toJSON();
    debtObj.remaining_amount = debt.getRemainingAmount();
    debtObj.payment_percentage = debt.getPaymentPercentage();
    debtObj.is_due_near = debt.isDueNear();
    debtObj.is_overdue = debt.isOverdue();

    res.status(200).json({
      success: true,
      data: debtObj
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Borç getirilemedi',
      error: error.message
    });
  }
};

/**
 * Yeni Borç Oluştur
 * POST /api/debts
 */
export const createDebt = async (req, res) => {
  try {
    const debtData = {
      ...req.body,
      user_id: req.user.id
    };

    const debt = await Debt.create(debtData);

    res.status(201).json({
      success: true,
      message: 'Borç kaydı oluşturuldu',
      data: debt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Borç oluşturulamadı',
      error: error.message
    });
  }
};

/**
 * Borç Güncelle
 * PUT /api/debts/:id
 */
export const updateDebt = async (req, res) => {
  try {
    const debt = await Debt.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!debt) {
      return res.status(404).json({
        success: false,
        message: 'Borç bulunamadı'
      });
    }

    await debt.update(req.body);

    // Ödeme durumunu otomatik güncelle
    const remaining = debt.getRemainingAmount();
    if (remaining <= 0) {
      debt.status = 'paid';
    } else if (parseFloat(debt.paid_amount) > 0) {
      debt.status = 'partial';
    } else {
      debt.status = 'pending';
    }
    await debt.save();

    res.status(200).json({
      success: true,
      message: 'Borç güncellendi',
      data: debt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Borç güncellenemedi',
      error: error.message
    });
  }
};

/**
 * Ödeme Yap / Tahsil Et
 * POST /api/debts/:id/payment
 */
export const makePayment = async (req, res) => {
  try {
    const { payment_amount } = req.body;

    if (!payment_amount || payment_amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir ödeme tutarı girin'
      });
    }

    const debt = await Debt.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!debt) {
      return res.status(404).json({
        success: false,
        message: 'Borç bulunamadı'
      });
    }

    const remaining = debt.getRemainingAmount();
    
    if (parseFloat(payment_amount) > remaining) {
      return res.status(400).json({
        success: false,
        message: `Ödeme tutarı kalan borçtan fazla olamaz (Kalan: ${remaining} TL)`
      });
    }

    // Ödemeyi ekle
    debt.paid_amount = parseFloat(debt.paid_amount) + parseFloat(payment_amount);

    // Durumu güncelle
    const newRemaining = debt.getRemainingAmount();
    if (newRemaining <= 0) {
      debt.status = 'paid';
    } else {
      debt.status = 'partial';
    }

    await debt.save();

    res.status(200).json({
      success: true,
      message: debt.type === 'payable' ? 'Ödeme yapıldı' : 'Tahsilat yapıldı',
      data: {
        debt,
        payment_amount: parseFloat(payment_amount),
        remaining_amount: newRemaining
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ödeme yapılamadı',
      error: error.message
    });
  }
};

/**
 * Borç Sil
 * DELETE /api/debts/:id
 */
export const deleteDebt = async (req, res) => {
  try {
    const debt = await Debt.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!debt) {
      return res.status(404).json({
        success: false,
        message: 'Borç bulunamadı'
      });
    }

    await debt.destroy();

    res.status(200).json({
      success: true,
      message: 'Borç silindi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Borç silinemedi',
      error: error.message
    });
  }
};


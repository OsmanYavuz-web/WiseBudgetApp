/**
 * Global Hata Yakalama Middleware
 * Tüm hataları yakalar ve uygun response döndürür
 */
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log hatayı konsola
  console.error('❌ Hata:', err);

  // Sequelize Validation Error
  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map(e => e.message).join(', ');
    error.message = message;
    error.statusCode = 400;
  }

  // Sequelize Unique Constraint Error
  if (err.name === 'SequelizeUniqueConstraintError') {
    error.message = 'Bu kayıt zaten mevcut';
    error.statusCode = 400;
  }

  // Sequelize Foreign Key Constraint Error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    error.message = 'İlişkili kayıtlar mevcut, işlem yapılamıyor';
    error.statusCode = 400;
  }

  // JWT Error
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Geçersiz token';
    error.statusCode = 401;
  }

  // JWT Expired Error
  if (err.name === 'TokenExpiredError') {
    error.message = 'Token süresi dolmuş';
    error.statusCode = 401;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Sunucu hatası',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * 404 Not Found Handler
 */
export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route bulunamadı: ${req.originalUrl}`
  });
};


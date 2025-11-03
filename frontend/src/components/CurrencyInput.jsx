import React from 'react';
import CurrencyInputField from 'react-currency-input-field';

/**
 * Para girişi için özelleştirilmiş input component'i
 * 
 * @param {string} label - Input etiketi
 * @param {string} name - Input adı
 * @param {string|number} value - Input değeri
 * @param {function} onChange - Değer değiştiğinde çağrılacak fonksiyon
 * @param {string} placeholder - Placeholder metni
 * @param {string} prefix - Para birimi öneki (varsayılan: ₺)
 * @param {boolean} required - Zorunlu alan mı?
 * @param {boolean} disabled - Devre dışı mı?
 * @param {string} className - Ek CSS sınıfları
 * @param {string} error - Hata mesajı
 */
const CurrencyInput = ({
  label,
  name,
  value,
  onChange,
  placeholder = '0,00',
  prefix = '₺ ',
  required = false,
  disabled = false,
  className = '',
  error = '',
  decimalsLimit = 2,
  allowNegativeValue = false,
  ...props
}) => {
  /**
   * Değer değiştiğinde çağrılır
   * @param {string} value - Formatlanmış değer
   * @param {string} name - Input adı
   * @param {object} values - Tüm değerler (float, formatted, value)
   */
  const handleValueChange = (value, name, values) => {
    // onChange fonksiyonuna hem formatlanmış hem de float değeri gönder
    if (onChange) {
      onChange({
        target: {
          name,
          value: values?.float || 0, // Float değer (hesaplamalar için)
          formattedValue: value, // Formatlanmış değer (gösterim için)
        }
      });
    }
  };

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <CurrencyInputField
        id={name}
        name={name}
        value={value}
        placeholder={placeholder}
        prefix={prefix}
        decimalsLimit={decimalsLimit}
        decimalSeparator=","
        groupSeparator="."
        allowNegativeValue={allowNegativeValue}
        disabled={disabled}
        onValueChange={handleValueChange}
        className={`
          w-full px-3 py-2 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-red-500' : 'border-gray-300'}
        `}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default CurrencyInput;


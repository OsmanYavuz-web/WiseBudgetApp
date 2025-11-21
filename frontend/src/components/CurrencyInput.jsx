import { NumericFormat } from 'react-number-format';
import { useAuthStore } from '../store/authStore';
import { currencySymbols } from '../utils/helpers';

/**
 * Para girişi için özelleştirilmiş input component'i
 * 
 * @param {string} label - Input etiketi
 * @param {string} name - Input adı
 * @param {string|number} value - Input değeri
 * @param {function} onChange - Değer değiştiğinde çağrılacak fonksiyon
 * @param {string} placeholder - Placeholder metni
 * @param {string} prefix - Para birimi öneki (varsayılan: kullanıcının seçtiği para birimi)
 * @param {string} currency - Para birimi kodu (TRY, USD, EUR vb.) - prefix'i override eder
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
  prefix,
  currency,
  required = false,
  disabled = false,
  className = '',
  error = '',
  decimalsLimit = 2,
  allowNegativeValue = false,
  ...props
}) => {
  const { user } = useAuthStore();
  
  // Para birimi prefix'ini belirle
  // Önce currency prop'u, sonra prefix prop'u, en son kullanıcının seçtiği para birimi
  const getPrefix = () => {
    if (prefix !== undefined) return prefix;
    if (currency) return `${currencySymbols[currency] || currency} `;
    const userCurrency = user?.currency || 'TRY';
    return `${currencySymbols[userCurrency] || '₺'} `;
  };
  
  const displayPrefix = getPrefix();
  /**
   * Değer değiştiğinde çağrılır
   * @param {object} values - Formatlanmış değer ve float değer
   */
  const handleValueChange = (values) => {
    const { formattedValue, floatValue } = values;
    
    // onChange fonksiyonuna hem formatlanmış hem de float değeri gönder
    if (onChange) {
      onChange({
        target: {
          name,
          value: floatValue !== undefined && floatValue !== null ? floatValue : '', // Float değer (hesaplamalar için), boş ise boş string
          formattedValue: formattedValue, // Formatlanmış değer (gösterim için)
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
      
      <NumericFormat
        id={name}
        name={name}
        value={value !== undefined && value !== null && value !== '' ? value : undefined}
        placeholder={placeholder}
        prefix={displayPrefix}
        decimalSeparator=","
        thousandSeparator="."
        decimalScale={decimalsLimit}
        fixedDecimalScale={false}
        allowNegative={allowNegativeValue}
        allowedDecimalSeparators={[',', '.']}
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

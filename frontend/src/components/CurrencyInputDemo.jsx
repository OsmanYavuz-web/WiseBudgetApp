import React, { useState } from 'react';
import CurrencyInput from './CurrencyInput';

/**
 * CurrencyInput component'i için örnek kullanım sayfası
 */
const CurrencyInputDemo = () => {
  const [formData, setFormData] = useState({
    amount: '',
    salary: 15000,
    expense: '',
    debt: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data:', formData);
    alert(`Girilen değerler:\n${JSON.stringify(formData, null, 2)}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        💰 Currency Input Örnekleri
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basit Kullanım */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            1. Basit Kullanım
          </h2>
          <CurrencyInput
            label="Tutar"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Tutar giriniz"
            required
          />
          <p className="text-sm text-gray-600">
            Değer: <strong>{formData.amount || 0}</strong>
          </p>
        </div>

        {/* Başlangıç Değeri ile */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            2. Başlangıç Değeri ile
          </h2>
          <CurrencyInput
            label="Maaş"
            name="salary"
            value={formData.salary}
            onChange={handleChange}
            placeholder="Maaş giriniz"
          />
          <p className="text-sm text-gray-600">
            Değer: <strong>₺ {formData.salary?.toLocaleString('tr-TR')}</strong>
          </p>
        </div>

        {/* Farklı Para Birimi */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            3. Farklı Para Birimleri
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CurrencyInput
              label="Dolar"
              name="usd"
              value={formData.usd}
              onChange={handleChange}
              prefix="$ "
            />
            <CurrencyInput
              label="Euro"
              name="eur"
              value={formData.eur}
              onChange={handleChange}
              prefix="€ "
            />
          </div>
        </div>

        {/* Negatif Değer İzni */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            4. Negatif Değer İzni (Borç/Alacak)
          </h2>
          <CurrencyInput
            label="Borç (-) / Alacak (+)"
            name="debt"
            value={formData.debt}
            onChange={handleChange}
            allowNegativeValue={true}
            placeholder="Tutar giriniz"
          />
          <p className="text-sm text-gray-600">
            Değer: <strong className={formData.debt < 0 ? 'text-red-600' : 'text-green-600'}>
              {formData.debt || 0}
            </strong>
          </p>
        </div>

        {/* Devre Dışı */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            5. Devre Dışı Input
          </h2>
          <CurrencyInput
            label="Sabit Tutar"
            name="fixed"
            value={5000}
            disabled={true}
          />
        </div>

        {/* Hata Durumu */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            6. Hata Durumu
          </h2>
          <CurrencyInput
            label="Gider"
            name="expense"
            value={formData.expense}
            onChange={handleChange}
            error={!formData.expense ? 'Bu alan zorunludur' : ''}
            required
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Formu Gönder
          </button>
        </div>
      </form>

      {/* Kullanım Bilgileri */}
      <div className="mt-8 bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">
          📝 Kullanım Notları
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Otomatik olarak binlik ayırıcı (.) ve ondalık ayırıcı (,) kullanır</li>
          <li>• Varsayılan olarak Türk Lirası (₺) öneki kullanır</li>
          <li>• <code className="bg-gray-200 px-1 rounded">prefix</code> prop'u ile farklı para birimleri kullanılabilir</li>
          <li>• <code className="bg-gray-200 px-1 rounded">allowNegativeValue</code> ile negatif değer girişi aktif edilebilir</li>
          <li>• <code className="bg-gray-200 px-1 rounded">decimalsLimit</code> ile ondalık basamak sayısı ayarlanabilir</li>
          <li>• onChange fonksiyonu hem float hem de formatlanmış değeri döner</li>
        </ul>
      </div>
    </div>
  );
};

export default CurrencyInputDemo;


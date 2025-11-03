# 🎨 Wise Budget - Frontend

React ve Vite ile geliştirilmiş modern, responsive frontend uygulaması.

## 🚀 Teknolojiler

- **React** 18.3 - UI library
- **Vite** 5.4 - Build tool & dev server
- **Tailwind CSS** 3.4 - Utility-first CSS framework
- **React Router DOM** 6.26 - Client-side routing
- **Zustand** 5.0 - State management
- **Axios** 1.7 - HTTP client
- **React Hot Toast** 2.4 - Toast notifications
- **React Icons** 5.3 - Icon library
- **React Currency Input Field** 3.8 - Para girişi için formatlanmış input

## 📦 Kurulum

### 1. Bağımlılıkları Yükleyin
```bash
npm install
```

### 2. Environment Variables (Opsiyonel)
`.env` dosyası oluşturun:

```env
VITE_API_URL=http://localhost:5000/api
```

Varsayılan olarak `http://localhost:5000/api` kullanılır.

### 3. Development Server'ı Başlatın
```bash
npm run dev
```

Uygulama `http://localhost:5173` adresinde çalışacaktır.

## 🏗️ Build

### Production Build
```bash
npm run build
```

Build dosyaları `dist/` klasöründe oluşturulur.

### Build'i Önizleme
```bash
npm run preview
```

## 📁 Proje Yapısı

```
frontend/
├── public/                 # Statik dosyalar
├── src/
│   ├── components/        # React bileşenleri
│   │   ├── Layout.jsx    # Ana layout wrapper
│   │   ├── ProtectedRoute.jsx  # Auth koruması
│   │   ├── CurrencyInput.jsx   # Para girişi component'i
│   │   └── CurrencyInputDemo.jsx  # Demo sayfası
│   │
│   ├── lib/              # Kütüphaneler
│   │   └── axios.js      # Axios instance
│   │
│   ├── pages/            # Sayfa bileşenleri
│   │   ├── Login.jsx     # Giriş sayfası
│   │   ├── Register.jsx  # Kayıt sayfası
│   │   ├── Dashboard.jsx # Ana sayfa
│   │   ├── Accounts.jsx  # Hesaplar
│   │   ├── Transactions.jsx  # İşlemler
│   │   ├── Debts.jsx     # Alacak/Verecek
│   │   └── Profile.jsx   # Profil
│   │
│   ├── store/            # Zustand store
│   │   └── authStore.js  # Auth state management
│   │
│   ├── utils/            # Yardımcı fonksiyonlar
│   │   └── helpers.js    # Format ve helper fonksiyonlar
│   │
│   ├── App.jsx           # Ana uygulama
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
│
├── index.html            # HTML template
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind configuration
├── postcss.config.js     # PostCSS configuration
└── package.json          # Dependencies
```

## 🎨 Stil Sistemi

### Tailwind CSS
Utility-first CSS framework kullanılıyor. Custom renkler ve tema:

```javascript
// tailwind.config.js
colors: {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    // ...
    600: '#0284c7',
    // ...
  }
}
```

### Global CSS Classes
```css
/* Butonlar */
.btn - Temel buton
.btn-primary - Birincil buton
.btn-secondary - İkincil buton

/* Kartlar */
.card - Temel kart

/* Input'lar */
.input - Temel input

/* Badge'ler */
.badge - Temel badge
.badge-income - Gelir badge'i
.badge-expense - Gider badge'i
.badge-transfer - Transfer badge'i
```

## 🔐 Authentication

### Zustand Store
```javascript
// src/store/authStore.js
const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'auth-storage' }
  )
)
```

### Protected Routes
```jsx
<Route path="/" element={
  <ProtectedRoute>
    <Layout />
  </ProtectedRoute>
}>
  <Route path="dashboard" element={<Dashboard />} />
  {/* ... */}
</Route>
```

## 📡 API İletişimi

### Axios Instance
```javascript
// src/lib/axios.js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
})

// Otomatik token ekleme
api.interceptors.request.use((config) => {
  const authStorage = localStorage.getItem('auth-storage')
  if (authStorage) {
    const { token } = JSON.parse(authStorage).state
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})
```

### Kullanım
```javascript
// GET
const response = await api.get('/accounts')
const accounts = response.data.data

// POST
await api.post('/transactions', {
  account_id: 1,
  amount: 100,
  type: 'expense'
})

// PUT
await api.put('/accounts/1', { name: 'Yeni İsim' })

// DELETE
await api.delete('/transactions/1')
```

## 🎯 Sayfalar

### Dashboard (`/dashboard`)
- Toplam bakiye özeti
- Aylık gelir/gider kartları
- Borç/alacak özeti
- Son işlemler listesi
- Hızlı işlem ekleme

### Accounts (`/accounts`)
- Hesap listesi (grid view)
- Hesap ekleme/düzenleme modal
- Hesap silme
- Bakiye gösterimi
- Kredi kartı limit takibi

### Transactions (`/transactions`)
- İşlem listesi (tablo view)
- Gelişmiş filtreleme
  - Tarih aralığı
  - Tutar aralığı
  - Hesap ve kategori
  - Arama
- İşlem ekleme/düzenleme
- İşlem silme

### Debts (`/debts`)
- Alacak/verecek listesi
- Borç özeti kartları
- Ödeme/tahsilat yapma
- Vade takibi
- Durum göstergeleri

### Profile (`/profile`)
- Kullanıcı bilgileri
- Şifre değiştirme
- Hesap ayarları

## 🎨 Bileşenler

### Layout
Ana layout wrapper. Sidebar ve header içerir.

```jsx
<Layout>
  <Outlet /> {/* Child routes */}
</Layout>
```

### ProtectedRoute
Kimlik doğrulama koruması.

```jsx
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

## 🛠️ Yardımcı Fonksiyonlar

### formatCurrency
```javascript
formatCurrency(1234.56) // "₺1.234,56"
formatCurrency(1234.56, 'USD') // "$1,234.56"
```

### formatDate
```javascript
formatDate('2024-01-15') // "15 Oca 2024"
```

### transactionTypeLabels
```javascript
transactionTypeLabels['income'] // "Gelir"
transactionTypeLabels['expense'] // "Gider"
transactionTypeLabels['transfer'] // "Transfer"
```

### accountTypeLabels
```javascript
accountTypeLabels['bank'] // "Banka Hesabı"
accountTypeLabels['credit_card'] // "Kredi Kartı"
// ...
```

## 🎨 Tema ve Renkler

### Primary Colors (Mavi)
- Dashboard kartları
- Butonlar
- Linkler

### Success (Yeşil)
- Gelir işlemleri
- Başarı mesajları
- Alacaklar

### Danger (Kırmızı)
- Gider işlemleri
- Hata mesajları
- Verecekler

### Warning (Sarı/Turuncu)
- Uyarı mesajları
- Vade yakın bildirimler

## 📱 Responsive Tasarım

### Breakpoints
```javascript
sm: '640px'   // Mobil
md: '768px'   // Tablet
lg: '1024px'  // Laptop
xl: '1280px'  // Desktop
2xl: '1536px' // Büyük ekran
```

### Mobile Menu
```jsx
{/* Mobil menü butonu */}
<button className="lg:hidden">
  <FiMenu />
</button>

{/* Sidebar */}
<aside className="fixed lg:static transform -translate-x-full lg:translate-x-0">
  {/* ... */}
</aside>
```

## 🔔 Bildirimler

### React Hot Toast
```javascript
import toast from 'react-hot-toast'

// Başarı
toast.success('İşlem başarılı')

// Hata
toast.error('Bir hata oluştu')

// Bilgi
toast('Bilgi mesajı')

// Loading
toast.loading('Yükleniyor...')
```

## 🧪 Linting

```bash
npm run lint
```

ESLint yapılandırması `.eslintrc.cjs` dosyasında.

## 🚀 Production Deployment

### Build
```bash
npm run build
```

### Nginx Örnek Yapılandırması
```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/wise-budget/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Troubleshooting

### API Bağlantı Hatası
- Backend'in çalıştığından emin olun
- CORS ayarlarını kontrol edin
- `.env` dosyasındaki API URL'ini doğrulayın

### Build Hatası
```bash
# node_modules'ü temizle ve yeniden yükle
rm -rf node_modules package-lock.json
npm install
```

### Token Hatası
- localStorage'da `auth-storage` key'ini kontrol edin
- Token'ın geçerli olduğundan emin olun
- Logout/login yaparak token'ı yenileyin

## 💰 CurrencyInput Component Kullanımı

Projede para girişi için özel bir `CurrencyInput` component'i bulunmaktadır. Bu component otomatik formatlama, maskeleme ve Türk Lirası desteği sunar.

### Temel Kullanım

```jsx
import CurrencyInput from '../components/CurrencyInput'

function MyForm() {
  const [amount, setAmount] = useState('')

  return (
    <CurrencyInput
      label="Tutar"
      name="amount"
      value={amount}
      onChange={(e) => setAmount(e.target.value)}
      placeholder="0,00"
      required
    />
  )
}
```

### Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|-----------|----------|
| `label` | string | - | Input etiketi |
| `name` | string | - | Input adı |
| `value` | string/number | - | Input değeri |
| `onChange` | function | - | Değer değişim fonksiyonu |
| `placeholder` | string | '0,00' | Placeholder metni |
| `prefix` | string | '₺ ' | Para birimi öneki |
| `required` | boolean | false | Zorunlu alan mı? |
| `disabled` | boolean | false | Devre dışı mı? |
| `error` | string | '' | Hata mesajı |
| `decimalsLimit` | number | 2 | Ondalık basamak sayısı |
| `allowNegativeValue` | boolean | false | Negatif değer izni |

### Özellikler

- ✅ Otomatik formatlama (1.234,56 formatında)
- ✅ Binlik ayırıcı (.) ve ondalık ayırıcı (,)
- ✅ Türk Lirası (₺) varsayılan prefix
- ✅ Farklı para birimleri ($, €, vb.)
- ✅ Negatif değer desteği
- ✅ Hata mesajı gösterimi
- ✅ Tailwind CSS ile stillendirilmiş

### Demo Sayfası

Tüm kullanım örneklerini görmek için `CurrencyInputDemo` component'ini kullanabilirsiniz:

```jsx
import CurrencyInputDemo from './components/CurrencyInputDemo'
```

### Kullanıldığı Sayfalar

- **Transactions**: İşlem tutarı, min/max filtre tutarları
- **Accounts**: Hesap bakiyesi, kredi kartı limiti
- **Debts**: Borç tutarı, ödenen tutar, ödeme tutarı

## 📚 Daha Fazla Bilgi

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [React Router Documentation](https://reactrouter.com/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [React Currency Input Field](https://github.com/cchanxzy/react-currency-input-field)

## 🎯 Best Practices

1. **Component Organization**: Her component kendi dosyasında
2. **State Management**: Global state için Zustand, local state için useState
3. **API Calls**: Axios instance kullan
4. **Styling**: Tailwind utility classes tercih et
5. **Error Handling**: Try-catch ve toast notifications
6. **Validation**: Frontend ve backend validation
7. **Loading States**: Loading spinner'ları göster
8. **Responsive**: Mobile-first approach

---

💡 Sorularınız için issue açabilirsiniz!


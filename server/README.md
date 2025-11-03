# 🔧 Wise Budget - Backend API

Node.js ve Express.js ile geliştirilmiş RESTful API backend'i.

## 🚀 Teknolojiler

- **Node.js** v16+
- **Express.js** - Web framework
- **MySQL** - İlişkisel veritabanı
- **Sequelize** - ORM (Object-Relational Mapping)
- **JWT** - Token tabanlı kimlik doğrulama
- **bcrypt** - Şifre hashleme
- **express-validator** - Input validasyonu
- **cors** - Cross-Origin Resource Sharing
- **dotenv** - Environment variables

## 📦 Kurulum

### 1. Bağımlılıkları Yükleyin
```bash
npm install
```

### 2. Environment Variables
`.env` dosyası oluşturun:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=wise_budget
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_EXPIRE=30d
```

### 3. Veritabanı Kurulumu

MySQL'de veritabanı oluşturun:
```sql
CREATE DATABASE wise_budget CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Varsayılan Verileri Yükleyin
```bash
npm run seed
```

### 5. Sunucuyu Başlatın

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

## 📚 API Endpoints

### 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| POST | `/register` | Yeni kullanıcı kaydı | ❌ |
| POST | `/login` | Kullanıcı girişi | ❌ |
| GET | `/me` | Mevcut kullanıcı bilgisi | ✅ |

### 💳 Accounts (`/api/accounts`)

| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| GET | `/` | Tüm hesapları listele | ✅ |
| GET | `/:id` | Tek hesap detayı | ✅ |
| POST | `/` | Yeni hesap oluştur | ✅ |
| PUT | `/:id` | Hesap güncelle | ✅ |
| DELETE | `/:id` | Hesap sil | ✅ |

### 📊 Transactions (`/api/transactions`)

| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| GET | `/` | Tüm işlemleri listele | ✅ |
| GET | `/summary` | İşlem özeti | ✅ |
| GET | `/:id` | Tek işlem detayı | ✅ |
| POST | `/` | Yeni işlem oluştur | ✅ |
| PUT | `/:id` | İşlem güncelle | ✅ |
| DELETE | `/:id` | İşlem sil | ✅ |

### 🏷️ Categories (`/api/categories`)

| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| GET | `/` | Tüm kategorileri listele | ✅ |
| GET | `/:id` | Tek kategori detayı | ✅ |
| POST | `/` | Yeni kategori oluştur | ✅ |
| PUT | `/:id` | Kategori güncelle | ✅ |
| DELETE | `/:id` | Kategori sil | ✅ |

### 👥 Debts (`/api/debts`)

| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| GET | `/` | Tüm borçları listele | ✅ |
| GET | `/summary` | Borç özeti | ✅ |
| GET | `/:id` | Tek borç detayı | ✅ |
| POST | `/` | Yeni borç kaydı oluştur | ✅ |
| PUT | `/:id` | Borç güncelle | ✅ |
| POST | `/:id/payment` | Ödeme/tahsilat yap | ✅ |
| DELETE | `/:id` | Borç sil | ✅ |

## 🗄️ Veritabanı Modelleri

### User (Kullanıcı)
```javascript
{
  id: INTEGER (PK),
  name: STRING,
  email: STRING (UNIQUE),
  password: STRING (HASHED),
  createdAt: DATE,
  updatedAt: DATE
}
```

### Account (Hesap)
```javascript
{
  id: INTEGER (PK),
  user_id: INTEGER (FK),
  name: STRING,
  type: ENUM('cash', 'bank', 'credit_card', 'investment', 'open_account', 'other'),
  balance: DECIMAL(15,2),
  currency: STRING,
  color: STRING,
  icon: STRING,
  description: TEXT,
  owner_name: STRING,
  credit_limit: DECIMAL(15,2),
  billing_day: INTEGER,
  payment_day: INTEGER,
  is_active: BOOLEAN,
  createdAt: DATE,
  updatedAt: DATE
}
```

### Category (Kategori)
```javascript
{
  id: INTEGER (PK),
  user_id: INTEGER (FK, NULL for system categories),
  name: STRING,
  type: ENUM('income', 'expense'),
  color: STRING,
  icon: STRING,
  is_system: BOOLEAN,
  createdAt: DATE,
  updatedAt: DATE
}
```

### Transaction (İşlem)
```javascript
{
  id: INTEGER (PK),
  user_id: INTEGER (FK),
  account_id: INTEGER (FK),
  category_id: INTEGER (FK),
  type: ENUM('income', 'expense', 'transfer'),
  amount: DECIMAL(15,2),
  description: TEXT,
  transaction_date: DATE,
  to_account_id: INTEGER (FK, for transfers),
  parent_transaction_id: INTEGER (FK),
  createdAt: DATE,
  updatedAt: DATE
}
```

### Debt (Borç/Alacak)
```javascript
{
  id: INTEGER (PK),
  user_id: INTEGER (FK),
  person_name: STRING,
  phone: STRING,
  type: ENUM('receivable', 'payable'),
  amount: DECIMAL(15,2),
  paid_amount: DECIMAL(15,2),
  currency: STRING,
  description: TEXT,
  debt_date: DATE,
  due_date: DATE,
  status: ENUM('pending', 'partial', 'paid'),
  notes: TEXT,
  createdAt: DATE,
  updatedAt: DATE
}
```

## 🔒 Middleware

### `protect`
JWT token doğrulama middleware'i. Korumalı route'lar için gerekli.

```javascript
// Kullanım
router.get('/protected', protect, controller)
```

### `validate`
Express-validator ile input validasyonu.

```javascript
// Kullanım
router.post('/', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  validate
], controller)
```

### `errorHandler`
Global hata yakalama middleware'i.

### `notFound`
404 hataları için middleware.

## 📝 Validation Rules

### User Registration
- `name`: Zorunlu, 2-50 karakter
- `email`: Zorunlu, geçerli email formatı
- `password`: Zorunlu, minimum 6 karakter

### Account Creation
- `name`: Zorunlu, maksimum 100 karakter
- `type`: Zorunlu, geçerli hesap tipi
- `balance`: Opsiyonel, geçerli sayı
- `currency`: Varsayılan 'TRY'

### Transaction Creation
- `account_id`: Zorunlu, geçerli hesap ID
- `category_id`: Zorunlu, geçerli kategori ID
- `type`: Zorunlu, geçerli işlem tipi
- `amount`: Zorunlu, 0'dan büyük
- `transaction_date`: Zorunlu, geçerli tarih

### Debt Creation
- `person_name`: Zorunlu, maksimum 100 karakter
- `type`: Zorunlu, 'receivable' veya 'payable'
- `amount`: Zorunlu, 0'dan büyük
- `debt_date`: Opsiyonel, geçerli tarih
- `due_date`: Opsiyonel, geçerli tarih

## 🧪 Test

```bash
npm test
```

## 📊 Veritabanı Yönetimi

### Veritabanı Oluşturma
```sql
CREATE DATABASE wise_budget CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Kategori Seed'leme
```bash
npm run seed
```

## 🔍 Debugging

Development modunda detaylı loglar için:
```bash
NODE_ENV=development npm run dev
```

## 🚀 Production Deployment

1. Environment variables'ı ayarlayın
2. `NODE_ENV=production` olarak ayarlayın
3. Güçlü bir `JWT_SECRET` kullanın
4. MySQL bağlantı bilgilerini güncelleyin
5. CORS ayarlarını yapılandırın

```bash
NODE_ENV=production npm start
```

## 📈 Performance Tips

- Veritabanı indexleri kullanılıyor
- Sequelize connection pooling aktif
- JWT token'lar 30 gün geçerli
- Şifreler bcrypt ile hashlenmiş (10 rounds)

## 🛡️ Güvenlik

- ✅ JWT authentication
- ✅ Bcrypt password hashing
- ✅ SQL injection koruması (Sequelize)
- ✅ Input validation
- ✅ CORS yapılandırması
- ✅ Environment variables

## 📞 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "İşlem başarılı",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Hata mesajı",
  "error": "Detaylı hata"
}
```

### Validation Error Response
```json
{
  "success": false,
  "message": "Validasyon hatası",
  "errors": [
    {
      "field": "email",
      "message": "Geçerli bir email girin"
    }
  ]
}
```

## 🔧 Troubleshooting

### Veritabanı Bağlantı Hatası
- MySQL'in çalıştığından emin olun
- `.env` dosyasındaki bilgileri kontrol edin
- Veritabanının oluşturulduğunu doğrulayın

### JWT Token Hatası
- `JWT_SECRET` ayarlandığından emin olun
- Token'ın süresi dolmamış olmalı
- Header'da `Authorization: Bearer <token>` formatı kullanın

### Port Zaten Kullanımda
```bash
# Port'u değiştirin veya çalışan process'i sonlandırın
lsof -ti:5000 | xargs kill -9
```

## 📚 Daha Fazla Bilgi

- [Express.js Documentation](https://expressjs.com/)
- [Sequelize Documentation](https://sequelize.org/)
- [JWT.io](https://jwt.io/)

---

💡 Sorularınız için issue açabilirsiniz!


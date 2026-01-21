# EduHive - Tezkor Boshlash Qo'llanmasi

## 🚀 5 daqiqada ishga tushirish

### 1. Dependencies o'rnatish

```bash
# Root papkada
npm install

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Database sozlash

PostgreSQL'da database yarating:

```sql
CREATE DATABASE eduhive;
```

### 3. Environment fayllarini sozlash

**Backend** (`backend/.env`):
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=eduhive

JWT_SECRET=change_this_to_random_string_min_32_chars
JWT_EXPIRES_IN=7d

PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 4. Ishga tushirish

```bash
# Root papkada (ikki terminal)
npm run dev

# Yoki alohida:
# Terminal 1
cd backend && npm run start:dev

# Terminal 2
cd frontend && npm run dev
```

### 5. Tekshirish

- Backend: http://localhost:3000
- Frontend: http://localhost:3001
- API Docs: http://localhost:3000/api/docs

## 📝 Birinchi Admin yaratish

Backend ishga tushgandan so'ng, Swagger UI orqali yoki API'ga to'g'ridan-to'g'ri so'rov yuborib admin yaratishingiz mumkin:

```bash
POST http://localhost:3000/api/auth/register
{
  "email": "admin@eduhive.com",
  "password": "admin123",
  "firstName": "Admin",
  "lastName": "User"
}
```

Keyin database'da user'ning `role` maydonini `admin` ga o'zgartiring:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@eduhive.com';
```

## 💳 To'lov Tizimlarini Sozlash

Production'da ishlatish uchun:

1. **Click** - https://my.click.uz dan merchant ID va secret key oling
2. **Payme** - https://payme.uz dan merchant ID va key oling
3. `.env` fayliga qo'shing:

```env
CLICK_MERCHANT_ID=your_merchant_id
CLICK_SERVICE_ID=your_service_id
CLICK_SECRET_KEY=your_secret_key
CLICK_MERCHANT_USER_ID=your_user_id

PAYME_MERCHANT_ID=your_merchant_id
PAYME_KEY=your_key
PAYME_TEST_KEY=your_test_key
```

## 🎯 Keyingi Qadamlar

1. ✅ Database'ga ma'lumotlar yuklash
2. ✅ Kurslar yaratish (Admin panel orqali)
3. ✅ To'lov tizimlarini test qilish
4. ✅ Webhook URL'larini sozlash

## ⚠️ Muhim Eslatmalar

- Development rejimida `synchronize: true` - production'da `false` qiling!
- JWT_SECRET'ni kuchli random string bilan almashtiring
- Production'da HTTPS ishlatishingiz kerak
- Webhook URL'lar production domain'ga sozlash kerak

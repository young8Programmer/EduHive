# EduHive - Premium Ta'lim Resurslari Platformasi

Professional darajada yaratilgan obuna asosidagi ta'lim platformasi. Bu loyiha to'liq funksional backend va frontend bilan ta'minlangan.

## 🚀 Xususiyatlar

- ✅ **Obuna Modeli**: Oylik va yillik obuna tizimi
- ✅ **To'lov Tizimi**: Click va Payme integratsiyasi
- ✅ **Access Control**: Premium kontentni himoya qilish
- ✅ **Content Management**: Kurslar va darslar boshqaruvi
- ✅ **Analytics Dashboard**: To'liq statistika va hisobotlar
- ✅ **ACID Transactions**: Xavfsiz moliyaviy operatsiyalar
- ✅ **Webhook Support**: To'lov tasdiqlash

## 📁 Loyiha Strukturasi

```
EduHive/
├── backend/          # NestJS Backend API
│   ├── src/
│   │   ├── auth/     # Authentication & Authorization
│   │   ├── users/    # User management
│   │   ├── courses/  # Course management
│   │   ├── subscriptions/  # Subscription management
│   │   ├── payments/  # Payment processing
│   │   └── analytics/ # Analytics & Reports
│   └── package.json
├── frontend/         # Next.js Frontend
│   ├── app/          # Next.js App Router
│   ├── components/   # React components
│   └── lib/          # Utilities & API client
└── package.json      # Root package.json
```

## 🛠 O'rnatish

### Talablar
- Node.js 18+
- PostgreSQL 14+
- npm yoki yarn

### 1. Repository ni klonlash

```bash
git clone <repository-url>
cd EduHive
```

### 2. Backend o'rnatish

```bash
cd backend
npm install
```

### 3. Database sozlash

PostgreSQL da yangi database yarating:

```sql
CREATE DATABASE eduhive;
```

Backend papkasida `.env` faylini yarating:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=eduhive

JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

CLICK_MERCHANT_ID=your_click_merchant_id
CLICK_SERVICE_ID=your_click_service_id
CLICK_SECRET_KEY=your_click_secret_key
CLICK_MERCHANT_USER_ID=your_click_merchant_user_id

PAYME_MERCHANT_ID=your_payme_merchant_id
PAYME_KEY=your_payme_key
PAYME_TEST_KEY=your_payme_test_key

PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
```

### 4. Frontend o'rnatish

```bash
cd frontend
npm install
```

Frontend papkasida `.env.local` faylini yarating:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 🚀 Ishga tushirish

### Development rejimida

Root papkada:

```bash
npm run dev
```

Bu backend va frontendni bir vaqtda ishga tushiradi.

Yoki alohida:

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Production rejimida

```bash
# Build
npm run build

# Start
cd backend && npm run start:prod
cd frontend && npm run start
```

## 📚 API Dokumentatsiya

Backend ishga tushgandan so'ng, Swagger dokumentatsiyasini quyidagi manzilda topasiz:

```
http://localhost:3000/api/docs
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Ro'yxatdan o'tish
- `POST /api/auth/login` - Kirish

### Courses
- `GET /api/courses` - Barcha kurslar
- `GET /api/courses/:id` - Kurs ma'lumotlari
- `POST /api/courses` - Yangi kurs (Admin)

### Subscriptions
- `POST /api/subscriptions` - Obuna sotib olish
- `GET /api/subscriptions/my` - Mening obunalarim
- `GET /api/subscriptions/check-access` - Obuna holatini tekshirish

### Payments
- `POST /api/payments/initiate` - To'lovni boshlash
- `POST /api/payments/webhook/click` - Click webhook
- `POST /api/payments/webhook/payme` - Payme webhook
- `GET /api/payments/my` - Mening to'lovlarim

### Analytics (Admin)
- `GET /api/analytics/dashboard` - Dashboard statistikasi
- `GET /api/analytics/revenue` - Daromad hisoboti

## 🗄 Database Schema

### Asosiy jadvallar:
- `users` - Foydalanuvchilar
- `courses` - Kurslar
- `lessons` - Darslar
- `subscriptions` - Obunalar
- `payments` - To'lovlar
- `invoices` - Invoyslar

## 🔒 Xavfsizlik

- JWT token authentication
- Password hashing (bcrypt)
- Role-based access control (RBAC)
- Subscription guards
- Webhook signature verification
- ACID transactions for payments

## 📝 Eslatmalar

1. **To'lov Tizimlari**: Click va Payme integratsiyasi to'liq ishlashi uchun ularning API kalitlarini olishingiz kerak.

2. **Webhook URL**: Production'da to'lov tizimlariga webhook URL'ni sozlashingiz kerak:
   - Click: `https://yourdomain.com/api/payments/webhook/click`
   - Payme: `https://yourdomain.com/api/payments/webhook/payme`

3. **Cron Jobs**: Obunalarni avtomatik expire qilish uchun cron job ishlaydi (har soat).

## 🤝 Yordam

Agar savollaringiz bo'lsa, issue oching yoki email yuboring.

## 📄 Litsenziya

Bu loyiha shaxsiy loyiha sifatida yaratilgan.

<!-- Update 1 -->

<!-- Update 2 -->

<!-- Update 3 -->

<!-- Update 4 -->

<!-- Update 5 -->

<!-- Update 6 -->

<!-- Update 7 -->

<!-- Update 8 -->

<!-- Update 9 -->

<!-- Update 10 -->

<!-- Update 11 -->

<!-- Update 12 -->

<!-- Update 13 -->

<!-- Update 14 -->

<!-- Update 15 -->

<!-- Update 16 -->

<!-- Update 17 -->

<!-- Update 18 -->

<!-- Update 19 -->

<!-- Update 20 -->

<!-- Update 21 -->

<!-- Update 22 -->

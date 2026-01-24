# Utilyze - Smart Utility Payment Platform

A Next.js 14 fintech application for managing utility payments with crypto-backed settlement flow.

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Slate-900 Primary, Amber-400 Accent)
- **Database:** PostgreSQL with Prisma ORM
- **Fonts:** Caveat & Kalam (Google Fonts) for handwritten brand identity

## 📦 Project Structure

```
utilyze-payment/
├── app/
│   ├── layout.tsx         # Root layout with Google Fonts
│   ├── page.tsx           # Homepage
│   └── globals.css        # Tailwind CSS styles
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── .env.example           # Environment variables template
└── package.json
```

## 🗄️ Database Schema

### Models

1. **User** - Authentication and user management
   - `id`, `email`, `name`, `passwordHash`

2. **Account** - Utility accounts (GAS, WATER)
   - Core: `type`, `meterNumber`, `address`
   - Plaid Integration: `plaidAccessToken`, `plaidItemId`, `bankName`

3. **Bill** - Utility bills
   - `amount`, `status` (UNPAID → PENDING_SETTLEMENT → PAID), `dueDate`

4. **PaymentTransaction** - Crypto-payment flow
   - `plaidTransactionId`, `cryptoTxHash`
   - `status` (INITIATED → FIAT_CONFIRMED → CRYPTO_SETTLED)

5. **UsageLog** - Consumption tracking
   - `value`, `unit` (Therms for gas, Gallons for water)

## 🌱 Seed Data

The database includes test data:
- **User:** Jane Doe (San Antonio, TX)
- **Accounts:**
  - Gas (Meter #5544)
  - Water (Meter #1122)
- **Bill:** $84.20 unpaid gas bill (due Dec 20, 2025)
- **Usage Logs:** Sample consumption data for both utilities

## 🔧 Setup Instructions

### 1. Environment Setup

Copy the environment template and configure your database:

```bash
cp .env.example .env
```

Update `DATABASE_URL` in `.env` with your PostgreSQL connection string.

### 2. Install Dependencies

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### 3. Database Setup

Push the schema to your database:

```bash
npx prisma db push
```

Seed the database with test data:

```bash
npx prisma db seed
```

View your data in Prisma Studio:

```bash
npx prisma studio
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎨 Design System

### Colors
- **Primary:** Slate-900 (`#0f172a`) - Dark, professional background
- **Accent:** Amber-400 (`#fbbf24`) - Vibrant highlights

### Typography
- **Headers:** Caveat (handwritten style)
- **Body:** Kalam (readable handwritten)

## 📝 Next Steps

1. **Set up PostgreSQL database** and update `.env`
2. **Run Prisma migrations:** `npx prisma db push`
3. **Seed the database:** `npx prisma db seed`
4. **Start building features:**
   - Authentication (login/signup)
   - Dashboard with usage visualization
   - Bill payment flow with Plaid integration
   - Crypto settlement tracking

## 🔐 Key APIs to Integrate

- **Plaid** - Open Banking for fiat payments
- **Google Gemini** - AI-powered insights

## 📚 Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

**Market:** USA (Currency: USD, Units: Therms/Gallons)

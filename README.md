# Food Factory Management System

Full-stack app: Angular 21 + Express.js + PostgreSQL

## Project Structure

```
food-factory/
├── backend/          Express.js REST API + Prisma ORM
└── frontend/         Angular 21 standalone components
```

## Quick Start

### 1. Database Setup (PostgreSQL)

Create a database:
```sql
CREATE DATABASE food_factory_db;
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

npm install
npx prisma migrate dev --name init
node prisma/seed.js
npm run dev
```

API runs at: http://localhost:3000

### 3. Frontend Setup

```bash
cd frontend
npm install
ng serve
```

App runs at: http://localhost:4200

---

## Default Admin Credentials

- Email: `admin@foodfactory.com`
- Password: `Admin@123`

---

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/register | Public | Customer register |
| POST | /api/auth/login | Public | Login |
| GET | /api/auth/profile | Any | Get profile |
| PUT | /api/auth/profile | Any | Update profile |
| GET | /api/products | Public | List products |
| POST | /api/products | Admin | Create product |
| PUT | /api/products/:id | Admin | Update product |
| DELETE | /api/products/:id | Admin | Delete product |
| GET | /api/categories | Public | List categories |
| POST | /api/categories | Admin | Create category |
| GET | /api/orders | Any | List orders (filtered by role) |
| POST | /api/orders | Customer | Place order |
| PATCH | /api/orders/:id/status | Admin | Update order status |
| GET | /api/orders/dashboard | Admin | Dashboard stats |
| POST | /api/payments/process | Any | Process payment |
| GET | /api/reports/sales | Admin | Sales report |
| GET | /api/reports/export/csv | Admin | Export CSV |
| GET | /api/users | Admin | List customers |
| GET | /api/settings | Any | Get settings |
| PUT | /api/settings | Admin | Update settings |

---

## Deployment

### Supabase (Database)
1. Create project at supabase.com
2. Copy connection string to `DATABASE_URL` in backend `.env`

### Render (Backend)
1. Push backend to GitHub
2. Create Web Service on render.com
3. Set environment variables
4. Build command: `npm install && npx prisma generate && npx prisma migrate deploy`
5. Start command: `npm start`

### Vercel (Frontend)
1. Push frontend to GitHub
2. Import project on vercel.com
3. Set `environment.prod.ts` API URL to your Render backend URL
4. Build command: `ng build --configuration=production`
5. Output directory: `dist/frontend/browser`

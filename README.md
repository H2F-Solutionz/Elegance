# ✨ Sparkle Bangles Shop

A full-stack e-commerce application for a bangles and jewelry store.

## Project Structure

```
sparkle-bangles-shop/
├── frontend/         # React + Vite + TypeScript + Tailwind + shadcn/ui
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── contexts/     # React context providers
│   │   ├── data/         # Static data/constants
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utilities & API client
│   │   ├── pages/        # Page components (public + admin)
│   │   └── ...
│   ├── .env              # VITE_API_URL
│   └── package.json
│
├── backend/          # Express + TypeScript + MongoDB Atlas (Mongoose)
│   ├── src/
│   │   ├── config/       # Database connection (db.ts)
│   │   ├── models/       # Mongoose schemas (User, Product, Order, Review)
│   │   ├── middleware/   # JWT auth middleware
│   │   ├── routes/       # API endpoints
│   │   ├── seed.ts       # Database seeder
│   │   └── server.ts     # Express app entry
│   ├── .env              # MONGODB_URI, JWT_SECRET
│   └── package.json
│
└── .gitignore
```

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install

# Edit .env with your MongoDB Atlas URI and JWT secret
# Then seed the database:
npm run seed

# Start the API server:
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install

# Start the dev server:
npm run dev
```

### Default Admin Credentials (after seeding)

- **Email:** admin@sparklebangles.com
- **Password:** admin123

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui |
| Backend  | Express.js, TypeScript, Mongoose    |
| Database | MongoDB Atlas                       |
| Auth     | JWT + bcryptjs                      |

## API Endpoints

| Method | Endpoint            | Auth     | Description              |
|--------|---------------------|----------|--------------------------|
| POST   | `/api/auth/register`| Public   | Register a new user      |
| POST   | `/api/auth/login`   | Public   | Login and get JWT        |
| GET    | `/api/auth/me`      | Bearer   | Get current user info    |
| GET    | `/api/products`     | Public   | List all products        |
| GET    | `/api/products/:id` | Public   | Get single product       |
| POST   | `/api/products`     | Admin    | Create product           |
| PUT    | `/api/products/:id` | Admin    | Update product           |
| DELETE | `/api/products/:id` | Admin    | Delete product           |
| GET    | `/api/orders`       | Admin    | List all orders          |
| POST   | `/api/orders`       | Bearer   | Place an order           |
| PUT    | `/api/orders/:id`   | Admin    | Update order status      |
| GET    | `/api/customers`    | Admin    | List all customers       |
| GET    | `/api/reviews`      | Admin    | List all reviews         |
| DELETE | `/api/reviews/:id`  | Admin    | Hide a review            |

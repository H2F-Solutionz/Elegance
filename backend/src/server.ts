import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load env vars before anything else
dotenv.config();

import connectDB from './config/db';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import customerRoutes from './routes/customers';
import reviewRoutes from './routes/reviews';
import paymentsRoutes from './routes/payments';
import userRoutes from './routes/users';
import adminRoutes from './routes/admin';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', message: 'Sparkle Bangles API is running 🚀' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Connect to MongoDB then start the server
const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`\n✨ Sparkle Bangles Backend running on http://localhost:${PORT}`);
        console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
        console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
        console.log(`🛒 Orders API:   http://localhost:${PORT}/api/orders`);
        console.log(`👥 Customers API: http://localhost:${PORT}/api/customers`);
        console.log(`⭐ Reviews API:  http://localhost:${PORT}/api/reviews\n`);
    });
};

startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});

export default app;

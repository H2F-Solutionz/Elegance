import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import User from '../models/User';
import { authenticate } from '../middleware/auth';

const router = Router();
let stripe: any = null;
try {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
        console.warn('⚠️  STRIPE_SECRET_KEY not configured in environment variables');
    } else {
        stripe = new Stripe(key, {
            apiVersion: '2023-10-16' as any,
        });
    }
} catch (err) {
    console.error('Failed to initialize Stripe:', err);
}

/**
 * POST /api/payments/create-checkout-session
 * Save user address and create a checkout session
 */
router.post('/create-checkout-session', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).userId;
        const { items, successUrl, cancelUrl, address } = req.body;

        if (!items || items.length === 0) {
            res.status(400).json({ error: 'No items provided for checkout' });
            return;
        }

        // Update user address if provided
        if (address && userId) {
            await User.findByIdAndUpdate(userId, {
                address: {
                    street: address.street,
                    city: address.city,
                    state: address.state,
                    zip_code: address.zip_code,
                    country: address.country,
                    phone: address.phone,
                }
            });
        }

        if (!stripe) {
            res.status(500).json({ error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.' });
            return;
        }

        const lineItems = items.map((item: any) => ({
            price_data: {
                currency: 'lkr',
                product_data: {
                    name: item.name,
                    images: item.image ? [item.image] : [],
                },
                unit_amount: Math.round(item.price * 100), // Stripe expects amounts in cents
            },
            quantity: item.quantity || 1,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: successUrl || 'http://localhost:8080/?success=true',
            cancel_url: cancelUrl || 'http://localhost:8080/cart?canceled=true',
        });

        res.json({ url: session.url });
    } catch (err: any) {
        console.error('Stripe error:', err);
        res.status(500).json({ error: err.message || 'Failed to create checkout session' });
    }
});

export default router;

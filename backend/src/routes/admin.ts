import { Router, Request, Response } from 'express';
import Settings from '../models/Settings';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * GET /api/admin/settings/payment-methods
 * Get current payment method settings
 */
router.get('/settings/payment-methods', async (req: Request, res: Response): Promise<void> => {
    try {
        let settings = await Settings.findOne();
        
        // If no settings exist, create default ones
        if (!settings) {
            settings = await Settings.create({
                payment_methods: {
                    stripe: true,
                    paypal: false,
                    cod: true,
                }
            });
        }

        res.json(settings.payment_methods);
    } catch (err: any) {
        console.error('Error fetching payment settings:', err);
        res.status(500).json({ error: err.message || 'Failed to fetch payment settings' });
    }
});

/**
 * PUT /api/admin/settings/payment-methods
 * Update payment method settings (admin only)
 * Body: { stripe?: boolean, paypal?: boolean, cod?: boolean }
 */
router.put('/settings/payment-methods', requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        const { stripe, paypal, cod } = req.body;

        let settings = await Settings.findOne();
        
        if (!settings) {
            settings = await Settings.create({
                payment_methods: {
                    stripe: stripe !== undefined ? stripe : true,
                    paypal: paypal !== undefined ? paypal : false,
                    cod: cod !== undefined ? cod : true,
                }
            });
        } else {
            // Update only the fields that were provided
            if (stripe !== undefined) settings.payment_methods.stripe = stripe;
            if (paypal !== undefined) settings.payment_methods.paypal = paypal;
            if (cod !== undefined) settings.payment_methods.cod = cod;
            
            await settings.save();
        }

        res.json({
            message: 'Payment methods updated successfully',
            payment_methods: settings.payment_methods
        });
    } catch (err: any) {
        console.error('Error updating payment settings:', err);
        res.status(500).json({ error: err.message || 'Failed to update payment settings' });
    }
});

export default router;

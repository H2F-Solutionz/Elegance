import { Router, Request, Response } from 'express';
import User from '../models/User';
import Order from '../models/Order';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * GET /api/customers
 * Admin only: List all customer profiles.
 */
router.get('/', requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        const { limit = '50', offset = '0' } = req.query;

        const total = await User.countDocuments();
        const customers = await User.find()
            .select('-password')
            .sort({ created_at: -1 })
            .skip(Number(offset))
            .limit(Number(limit));

        res.json({ customers, total });
    } catch (err) {
        console.error('Error fetching customers:', err);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

/**
 * GET /api/customers/:id
 * Admin only: Get a single customer profile and their order count.
 */
router.get('/:id', requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        const customer = await User.findById(req.params.id).select('-password');

        if (!customer) {
            res.status(404).json({ error: 'Customer not found' });
            return;
        }

        // Get order count for this customer
        const orderCount = await Order.countDocuments({ user_id: req.params.id });

        res.json({
            ...customer.toObject(),
            order_count: orderCount,
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch customer' });
    }
});

export default router;

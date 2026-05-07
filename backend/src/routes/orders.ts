import { Router, Request, Response } from 'express';
import Order from '../models/Order';
import User from '../models/User';
import Product from '../models/Product';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * GET /api/orders
 * Admin only: List all orders.
 */
router.get('/', requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        const { status, limit = '50', offset = '0' } = req.query;
        const filter: any = {};

        if (status) {
            filter.status = status as string;
        }

        const total = await Order.countDocuments(filter);
        const orders = await Order.find(filter)
            .populate('user_id', 'email display_name')
            .populate('product_id', 'name price image')
            .sort({ created_at: -1 })
            .skip(Number(offset))
            .limit(Number(limit));

        res.json({ orders, total });
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

/**
 * GET /api/orders/stats
 * Admin only: Get dashboard statistics.
 */
router.get('/stats', requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        const totalOrders = await Order.countDocuments();
        
        const revenueResult = await Order.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            { $group: { _id: null, total: { $sum: '$total_amount' } } }
        ]);
        const totalRevenue = revenueResult[0]?.total || 0;

        const totalCustomers = await Order.distinct('user_id').then(ids => ids.length);
        
        const recentOrders = await Order.find()
            .populate('user_id', 'display_name email')
            .populate('product_id', 'name')
            .sort({ created_at: -1 })
            .limit(5);

        res.json({
            totalRevenue,
            totalOrders,
            totalCustomers,
            recentOrders
        });
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

/**
 * GET /api/orders/:id
 * Admin only: Get a single order.
 */
router.get('/:id', requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user_id', 'email display_name')
            .populate('product_id', 'name price image');

        if (!order) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }

        res.json(order);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

/**
 * POST /api/orders
 * Authenticated: Place a new order.
 */
router.post('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
    try {
        const { product_id, quantity, total_amount, email, phone, delivery_address } = req.body;

        if (!product_id || !total_amount) {
            res.status(400).json({ error: 'product_id and total_amount are required' });
            return;
        }

        const order = await Order.create({
            user_id: req.user!.id,
            product_id,
            quantity: quantity || 1,
            total_amount,
            email,
            phone,
            delivery_address,
        });

        res.status(201).json(order);
    } catch (err) {
        console.error('Error creating order:', err);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

/**
 * PUT /api/orders/:id
 * Admin only: Update order status.
 */
router.put('/:id', requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        const { status } = req.body;

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'];
        if (status && !validStatuses.includes(status)) {
            res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
            return;
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: { status } },
            { new: true }
        );

        if (!order) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }

        res.json(order);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update order' });
    }
});

export default router;

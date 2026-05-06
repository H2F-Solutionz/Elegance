import { Router, Request, Response } from 'express';
import User from '../models/User';
import Order from '../models/Order';
import { requireAuth } from '../middleware/auth';

const router = Router();

/**
 * GET /api/users/dashboard
 * Fetch user's profile, wishlist, and orders
 */
router.get('/dashboard', requireAuth, async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user?.id)
            .populate('wishlist')
            .populate('cart.product');

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const orders = await Order.find({ user_id: user._id })
            .sort({ created_at: -1 });

        res.json({
            user: {
                id: user._id,
                email: user.email,
                display_name: user.display_name,
                avatar_url: user.avatar_url,
                role: user.role,
                wishlist: user.wishlist,
                cart: user.cart,
            },
            orders
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch dashboard' });
    }
});

/**
 * GET /api/users/me
 * Get current user's profile information
 */
router.get('/me', requireAuth, async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user?.id);

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json({
            _id: user._id,
            email: user.email,
            display_name: user.display_name,
            avatar_url: user.avatar_url,
            role: user.role,
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

/**
 * POST /api/users/wishlist/toggle/:productId
 */
router.post('/wishlist/toggle/:productId', requireAuth, async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user?.id);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const productId = req.params.productId as any;
        const index = user.wishlist.indexOf(productId);

        if (index === -1) {
            user.wishlist.push(productId);
        } else {
            user.wishlist.splice(index, 1);
        }

        await user.save();
        res.json({ wishlist: user.wishlist });
    } catch (err) {
        res.status(500).json({ error: 'Failed to toggle wishlist' });
    }
});

/**
 * POST /api/users/cart
 * Update full cart (sync from client or update on client actions)
 */
router.post('/cart', requireAuth, async (req: Request, res: Response): Promise<void> => {
    try {
        const { items } = req.body; // Array of { product: id, quantity: number }
        const user = await User.findByIdAndUpdate(
            req.user?.id,
            { $set: { cart: items } },
            { new: true }
        ).populate('cart.product');

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json({ cart: user.cart });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update cart' });
    }
});

export default router;

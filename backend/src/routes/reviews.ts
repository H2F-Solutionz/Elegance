import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import Review from '../models/Review';
import Product from '../models/Product';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * GET /api/reviews
 * Admin only: List all reviews.
 */
router.get('/', requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        const { product_id, limit = '50', offset = '0' } = req.query;
        const filter: any = {};

        if (product_id) {
            filter.product_id = product_id as string;
        }

        const total = await Review.countDocuments(filter);
        const reviews = await Review.find(filter)
            .populate('user_id', 'email display_name')
            .populate('product_id', 'name')
            .sort({ created_at: -1 })
            .skip(Number(offset))
            .limit(Number(limit));

        res.json({ reviews, total });
    } catch (err) {
        console.error('Error fetching reviews:', err);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

/**
 * GET /api/reviews/product/:productId
 * Public: Get reviews for a specific product.
 */
router.get('/product/:productId', async (req: Request, res: Response): Promise<void> => {
    try {
        const reviews = await Review.find({ 
            product_id: req.params.productId,
            is_visible: true 
        })
        .populate('user_id', 'display_name avatar_url')
        .sort({ created_at: -1 });

        res.json(reviews);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

/**
 * POST /api/reviews
 * Auth required: Post a new review.
 */
router.post('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
    try {
        const { product_id, rating, review_text, order_id } = req.body;
        
        // Basic validation
        if (!product_id || !rating || !review_text) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        // Validate IDs
        if (!mongoose.isValidObjectId(product_id)) {
            res.status(400).json({ error: 'Invalid product_id format' });
            return;
        }

        const review = new Review({
            user_id: new mongoose.Types.ObjectId(req.user!.id),
            product_id: new mongoose.Types.ObjectId(product_id),
            rating,
            review_text,
            order_id: order_id && mongoose.isValidObjectId(order_id) ? new mongoose.Types.ObjectId(order_id) : undefined,
            is_visible: true
        });

        await review.save();

        // Update Product's average rating and count
        const product = await Product.findById(product_id);
        if (product) {
            const allReviews = await Review.find({ product_id: new mongoose.Types.ObjectId(product_id), is_visible: true });
            console.log(`Updating rating for ${product.name}: ${allReviews.length} reviews found`);
            
            if (allReviews.length > 0) {
                const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
                product.rating = Number((totalRating / allReviews.length).toFixed(1));
                product.reviews = allReviews.length;
            } else {
                product.rating = rating;
                product.reviews = 1;
            }
            const savedProduct = await product.save();
            console.log(`Successfully recalculated rating for ${product.name}. New rating: ${savedProduct.rating}, Total reviews: ${savedProduct.reviews}`);
        } else {
            console.warn(`Product not found during rating update: ${product_id}`);
        }

        res.status(201).json(review);
    } catch (err: any) {
        console.error('CRITICAL ERROR posting review:', {
            message: err.message,
            stack: err.stack,
            body: req.body,
            user: req.user
        });
        res.status(500).json({ error: 'Failed to post review', details: err.message });
    }
});

/**
 * DELETE /api/reviews/:id
 * Admin only: Hide a review (set is_visible to false).
 */
router.delete('/:id', requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { $set: { is_visible: false } },
            { new: true }
        );

        if (!review) {
            res.status(404).json({ error: 'Review not found' });
            return;
        }

        res.json({ message: 'Review hidden', review });
    } catch (err) {
        res.status(500).json({ error: 'Failed to hide review' });
    }
});

export default router;

import { Router, Request, Response } from 'express';
import Product from '../models/Product';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * GET /api/products
 * Public: Returns all products. Supports ?category= and ?hot_sales= and ?latest= filters.
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const { category, hot_sales, latest } = req.query;
        const filter: any = {};

        if (category) {
            filter.category = category;
        }
        if (hot_sales === 'true') {
            filter.isHotSale = true;
        }
        if (latest === 'true') {
            filter.isLatestArrival = true;
        }

        const products = await Product.find(filter).sort({ created_at: -1 });
        res.json(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

/**
 * GET /api/products/:id
 * Public: Returns a single product.
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

/**
 * POST /api/products
 * Admin only: Create a new product.
 */
router.post('/', requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await Product.create({
            ...req.body,
            rating: req.body.rating || 0,
            reviews: 0,
            inStock: req.body.inStock !== false,
        });
        res.status(201).json(product);
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

/**
 * PUT /api/products/:id
 * Admin only: Update a product.
 */
router.put('/:id', requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!product) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update product' });
    }
});

/**
 * DELETE /api/products/:id
 * Admin only: Delete a product.
 */
router.delete('/:id', requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        res.json({ message: 'Product deleted', product });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

export default router;

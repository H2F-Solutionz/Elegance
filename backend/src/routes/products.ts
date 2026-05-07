import { Router, Request, Response } from 'express';
import Product from '../models/Product';
import { requireAuth, requireAdmin } from '../middleware/auth';
import cloudinary from '../config/cloudinary';

const router = Router();

// Helper to upload to Cloudinary
const uploadToCloudinary = async (imageStr: string) => {
    if (!imageStr || !imageStr.startsWith('data:image')) return imageStr;
    try {
        const uploadResponse = await cloudinary.uploader.upload(imageStr, {
            folder: 'sparkle_bangles',
        });
        return uploadResponse.secure_url;
    } catch (err) {
        console.error('Cloudinary upload error:', err);
        throw new Error('Image upload failed');
    }
};

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
        let { image, ...rest } = req.body;
        
        if (image) {
            image = await uploadToCloudinary(image);
        }

        const product = await Product.create({
            ...rest,
            image,
            rating: req.body.rating || 0,
            reviews: 0,
            inStock: req.body.inStock !== false,
        });
        res.status(201).json(product);
    } catch (err: any) {
        console.error('Error creating product:', err);
        res.status(500).json({ error: err.message || 'Failed to create product' });
    }
});

/**
 * PUT /api/products/:id
 * Admin only: Update a product.
 */
router.put('/:id', requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        let updateData = { ...req.body };
        
        if (updateData.image && updateData.image.startsWith('data:image')) {
            updateData.image = await uploadToCloudinary(updateData.image);
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        );
        if (!product) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        res.json(product);
    } catch (err: any) {
        console.error('Error updating product:', err);
        res.status(500).json({ error: err.message || 'Failed to update product' });
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

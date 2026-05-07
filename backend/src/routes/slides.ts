import { Router, Request, Response } from 'express';
import Slide from '../models/Slide';
import { requireAuth, requireAdmin } from '../middleware/auth';
import cloudinary from '../config/cloudinary';

const router = Router();

// Default slides to seed if none exist
const DEFAULT_SLIDES = [
    {
        title: 'Timeless Elegance',
        subtitle: 'Discover Our Wedding Collection',
        description: 'Exquisite bangles crafted with love for your special moments',
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920',
        cta: 'Shop Wedding',
        link: '/categories/women?filter=wedding',
        order: 0,
        active: true,
    },
    {
        title: 'New Arrivals',
        subtitle: 'Contemporary Designs',
        description: 'Modern minimalist pieces for the everyday woman',
        image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1920',
        cta: 'Explore Now',
        link: '/latest-arrivals',
        order: 1,
        active: true,
    },
    {
        title: 'Festive Sale',
        subtitle: 'Up to 30% Off',
        description: 'Celebrate with stunning gold and diamond bangles',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1920',
        cta: 'Shop Deals',
        link: '/hot-sales',
        order: 2,
        active: true,
    },
];

/**
 * GET /api/slides
 * Public: Get all active slides sorted by order
 */
router.get('/', async (_req: Request, res: Response): Promise<void> => {
    try {
        let slides = await Slide.find({ active: true }).sort({ order: 1 });

        // Auto-seed defaults if no slides exist
        if (slides.length === 0) {
            const created = await Slide.insertMany(DEFAULT_SLIDES);
            slides = created as any;
        }

        res.json(slides);
    } catch (err: any) {
        console.error('Error fetching slides:', err);
        res.status(500).json({ error: err.message || 'Failed to fetch slides' });
    }
});

/**
 * GET /api/slides/admin/all
 * Admin: Get ALL slides (active + inactive)
 */
router.get('/admin/all', requireAuth, requireAdmin, async (_req: Request, res: Response): Promise<void> => {
    try {
        let slides = await Slide.find().sort({ order: 1 });

        if (slides.length === 0) {
            const created = await Slide.insertMany(DEFAULT_SLIDES);
            slides = created as any;
        }

        res.json(slides);
    } catch (err: any) {
        res.status(500).json({ error: err.message || 'Failed to fetch slides' });
    }
});

/**
 * POST /api/slides
 * Admin: Create a new slide
 * Body: { title, subtitle, description, image (base64 or URL), cta, link, order, active }
 */
router.post('/', requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, subtitle, description, image, cta, link, order, active } = req.body;

        if (!title || !image) {
            res.status(400).json({ error: 'Title and image are required' });
            return;
        }

        let imageUrl = image;

        // If image is a base64 data URI, upload to Cloudinary
        if (image.startsWith('data:')) {
            const uploadResult = await cloudinary.uploader.upload(image, {
                folder: 'sparkle-bangles/slides',
                resource_type: 'image',
            });
            imageUrl = uploadResult.secure_url;
        }

        // Auto-assign order if not given
        const lastSlide = await Slide.findOne().sort({ order: -1 });
        const newOrder = order !== undefined ? order : (lastSlide ? lastSlide.order + 1 : 0);

        const slide = await Slide.create({
            title,
            subtitle: subtitle || '',
            description: description || '',
            image: imageUrl,
            cta: cta || 'Shop Now',
            link: link || '/',
            order: newOrder,
            active: active !== undefined ? active : true,
        });

        res.status(201).json(slide);
    } catch (err: any) {
        console.error('Error creating slide:', err);
        res.status(500).json({ error: err.message || 'Failed to create slide' });
    }
});

/**
 * PUT /api/slides/:id
 * Admin: Update a slide
 */
router.put('/:id', requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, subtitle, description, image, cta, link, order, active } = req.body;

        const slide = await Slide.findById(req.params.id);
        if (!slide) {
            res.status(404).json({ error: 'Slide not found' });
            return;
        }

        let imageUrl = image;

        // If image is a base64 data URI, upload to Cloudinary
        if (image && image.startsWith('data:')) {
            const uploadResult = await cloudinary.uploader.upload(image, {
                folder: 'sparkle-bangles/slides',
                resource_type: 'image',
            });
            imageUrl = uploadResult.secure_url;
        }

        if (title !== undefined) slide.title = title;
        if (subtitle !== undefined) slide.subtitle = subtitle;
        if (description !== undefined) slide.description = description;
        if (imageUrl !== undefined) slide.image = imageUrl;
        if (cta !== undefined) slide.cta = cta;
        if (link !== undefined) slide.link = link;
        if (order !== undefined) slide.order = order;
        if (active !== undefined) slide.active = active;

        await slide.save();
        res.json(slide);
    } catch (err: any) {
        console.error('Error updating slide:', err);
        res.status(500).json({ error: err.message || 'Failed to update slide' });
    }
});

/**
 * DELETE /api/slides/:id
 * Admin: Delete a slide
 */
router.delete('/:id', requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        const slide = await Slide.findByIdAndDelete(req.params.id);
        if (!slide) {
            res.status(404).json({ error: 'Slide not found' });
            return;
        }
        res.json({ message: 'Slide deleted successfully' });
    } catch (err: any) {
        console.error('Error deleting slide:', err);
        res.status(500).json({ error: err.message || 'Failed to delete slide' });
    }
});

export default router;

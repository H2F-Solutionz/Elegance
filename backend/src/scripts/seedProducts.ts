import mongoose from 'mongoose';
import Product from '../models/Product';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const products = [
    {
        name: 'Gold Plated Traditional Bangle Set',
        price: 1499,
        originalPrice: 2499,
        image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800',
        category: 'women',
        description: 'Meticulously crafted gold-plated bangles with intricate traditional patterns. Perfect for weddings and special occasions.',
        isHotSale: true,
        isLatestArrival: false,
        material: 'Gold Plated Alloy',
        inStock: true
    },
    {
        name: 'Silver Filigree Bracelet',
        price: 899,
        originalPrice: 1299,
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
        category: 'women',
        description: 'Elegant sterling silver bracelet featuring delicate filigree work. A timeless piece for any collection.',
        isHotSale: false,
        isLatestArrival: true,
        material: '925 Sterling Silver',
        inStock: true
    },
    {
        name: 'Mens Solid Copper Kada',
        price: 599,
        originalPrice: 799,
        image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800',
        category: 'men',
        description: 'Bold and traditional solid copper kada for men. Known for its therapeutic properties and classic style.',
        isHotSale: true,
        isLatestArrival: false,
        material: 'Pure Copper',
        inStock: true
    },
    {
        name: 'Kids Colorful Enamel Bangles',
        price: 399,
        originalPrice: 499,
        image: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800',
        category: 'kids',
        description: 'Vibrant and safe enamel-coated bangles for children. Lightweight and perfect for daily wear.',
        isHotSale: false,
        isLatestArrival: true,
        material: 'Enamel Coated Metal',
        inStock: true
    }
];

const seedProducts = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI not found');

        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        await Product.deleteMany({});
        console.log('Cleared existing products');

        await Product.insertMany(products);
        console.log('Products seeded successfully');

        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err);
        process.exit(1);
    }
};

seedProducts();

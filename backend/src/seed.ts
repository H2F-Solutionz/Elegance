import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from './config/db';
import User from './models/User';
import Product from './models/Product';
import Review from './models/Review';

const seedProducts = [
    {
        name: 'Royal Gold Bangle Set', price: 2499, originalPrice: 2999,
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500',
        category: 'women', subCategory: 'wedding',
        description: 'Exquisite 22K gold bangle set with intricate traditional designs.',
        isHotSale: true, rating: 4.8, reviews: 124, inStock: true, material: '22K Gold', weight: '45g',
    },
    {
        name: 'Diamond Studded Kada', price: 4599, originalPrice: 5299,
        image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=500',
        category: 'women', subCategory: 'wedding',
        description: 'Stunning diamond-studded kada with brilliant cut diamonds.',
        isHotSale: true, rating: 4.9, reviews: 89, inStock: true, material: '18K White Gold', weight: '38g',
    },
    {
        name: 'Rose Gold Minimalist Bangle', price: 1299,
        image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500',
        category: 'women', subCategory: 'casual',
        description: 'Elegant rose gold bangle with a minimalist design.',
        isLatestArrival: true, rating: 4.7, reviews: 56, inStock: true, material: '14K Rose Gold', weight: '18g',
    },
    {
        name: 'Pearl & Gold Bracelet', price: 1899,
        image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=500',
        category: 'women', subCategory: 'dancing',
        description: 'Beautiful pearl and gold combination bracelet.',
        isLatestArrival: true, rating: 4.6, reviews: 78, inStock: true, material: '18K Gold with Pearls', weight: '22g',
    },
    {
        name: 'Traditional Temple Bangle', price: 3299, originalPrice: 3799,
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500',
        category: 'women', subCategory: 'wedding',
        description: 'Classic temple design bangle with traditional motifs.',
        isHotSale: true, rating: 4.9, reviews: 145, inStock: true, material: '22K Gold', weight: '52g',
    },
    {
        name: 'Sleek Silver Cuff', price: 799,
        image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=500',
        category: 'men',
        description: 'Modern silver cuff with a polished finish.',
        isLatestArrival: true, rating: 4.5, reviews: 42, inStock: true, material: 'Sterling Silver', weight: '28g',
    },
    {
        name: 'Mens Solid Copper Kada', price: 599, originalPrice: 799,
        image: 'https://images.unsplash.com/photo-1611085583191-a3b130a8b19a?w=500',
        category: 'men',
        description: 'Classic solid copper kada with spiritual significance.',
        isHotSale: false, rating: 4.4, reviews: 31, inStock: true, material: 'Pure Copper', weight: '35g',
    },
    {
        name: 'Kids Gold Bangle Pair', price: 999,
        image: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=500',
        category: 'kids',
        description: 'Adorable gold bangle pair designed specially for children.',
        isLatestArrival: true, rating: 4.8, reviews: 67, inStock: true, material: '18K Gold', weight: '8g',
    },
    {
        name: 'Kids Silver Anklet Set', price: 499,
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500',
        category: 'kids',
        description: 'Delicate silver anklets with small bells for children.',
        isLatestArrival: false, rating: 4.7, reviews: 24, inStock: true, material: 'Sterling Silver', weight: '12g',
    },
    {
        name: 'Antique Gold Kada Set', price: 5499, originalPrice: 6299,
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500',
        category: 'women', subCategory: 'wedding',
        description: 'Magnificent antique gold kada set with detailed craftsmanship.',
        isHotSale: true, rating: 5.0, reviews: 203, inStock: true, material: '22K Antique Gold', weight: '68g',
    },
    {
        name: 'Gold Plated Traditional Bangle Set', price: 1499, originalPrice: 2499,
        image: 'https://images.unsplash.com/photo-1611085583191-a3b130a8b19a?w=500',
        category: 'women', subCategory: 'casual',
        description: 'Meticulously crafted gold-plated bangles with intricate traditional patterns.',
        isHotSale: true, rating: 0, reviews: 0, inStock: true, material: 'Gold Plated Alloy', weight: '40g',
    }
];

const seed = async () => {
    try {
        await connectDB();

        // Clear existing data
        await Product.deleteMany({});
        await User.deleteMany({});

        console.log('🗑️  Cleared existing data');

        // Create admin user
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        await User.create({
            email: 'admin@sparklebangles.com',
            password: hashedPassword,
            display_name: 'Admin',
            role: 'admin',
        });

        console.log('👤 Created admin user (admin@sparklebangles.com / admin123)');

        // Seed products
        const createdProducts = await Product.insertMany(seedProducts);
        console.log(`📦 Seeded ${createdProducts.length} products`);

        // Create a sample user for reviews
        const sampleUserPassword = await bcrypt.hash('user123', salt);
        const sampleUser = await User.create({
            email: 'user@example.com',
            password: sampleUserPassword,
            display_name: 'Sarah J.',
            role: 'user',
        });

        // Seed some reviews
        const reviews = createdProducts.map(product => ({
            user_id: sampleUser._id,
            product_id: product._id,
            rating: 5,
            review_text: `Absolutely love this ${product.name}! The quality is outstanding and it looks even better in person. Highly recommend!`,
            is_verified_purchase: true,
            is_visible: true
        }));

        await Review.deleteMany({});
        await Review.insertMany(reviews);
        console.log(`⭐ Seeded ${reviews.length} initial reviews`);

        console.log('\n✅ Database seeded with products and reviews successfully!\n');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seed();

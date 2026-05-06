import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const seed = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI not found in .env');

        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const email = 'admin@sparklebangles.com';
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 12);

        const adminUser = await User.findOneAndUpdate(
            { email: email.toLowerCase() },
            {
                email: email.toLowerCase(),
                password: hashedPassword,
                display_name: 'Store Admin',
                role: 'admin',
                is_blocked: false
            },
            { upsert: true, new: true }
        );

        console.log('Admin user created/updated:', adminUser.email);
        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err);
        process.exit(1);
    }
};

seed();

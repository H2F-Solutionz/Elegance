import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    images?: string[];
    category: 'women' | 'men' | 'kids';
    subCategory?: 'wedding' | 'casual' | 'dancing';
    description: string;
    isHotSale: boolean;
    isLatestArrival: boolean;
    rating: number;
    reviews: number;
    inStock: boolean;
    stock?: number;
    material?: string;
    weight?: string;
    created_at: Date;
    updated_at: Date;
}

const ProductSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
    },
    originalPrice: {
        type: Number,
        default: null,
    },
    image: {
        type: String,
        required: true,
    },
    images: {
        type: [String],
        default: [],
    },
    category: {
        type: String,
        required: true,
        enum: ['women', 'men', 'kids'],
    },
    subCategory: {
        type: String,
        enum: ['wedding', 'casual', 'dancing'],
        default: null,
    },
    description: {
        type: String,
        required: true,
    },
    isHotSale: {
        type: Boolean,
        default: false,
    },
    isLatestArrival: {
        type: Boolean,
        default: false,
    },
    rating: {
        type: Number,
        default: 0,
    },
    reviews: {
        type: Number,
        default: 0,
    },
    inStock: {
        type: Boolean,
        default: true,
    },
    stock: {
        type: Number,
        default: 0,
    },
    material: {
        type: String,
        default: null,
    },
    weight: {
        type: String,
        default: null,
    },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

export default mongoose.model<IProduct>('Product', ProductSchema);

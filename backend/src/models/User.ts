import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password: string;
    display_name?: string;
    avatar_url?: string;
    is_blocked: boolean;
    role: 'admin' | 'moderator' | 'user';
    wishlist: mongoose.Types.ObjectId[];
    cart: {
        product: mongoose.Types.ObjectId;
        quantity: number;
    }[];
    address?: {
        street: string;
        city: string;
        state: string;
        zip_code: string;
        country: string;
        phone?: string;
    };
    created_at: Date;
    updated_at: Date;
}

const UserSchema: Schema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    display_name: {
        type: String,
        default: null,
    },
    avatar_url: {
        type: String,
        default: null,
    },
    is_blocked: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum: ['admin', 'moderator', 'user'],
        default: 'user',
    },
    wishlist: [{
        type: Schema.Types.ObjectId,
        ref: 'Product',
        default: [],
    }],
    cart: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
        },
        quantity: {
            type: Number,
            default: 1,
        },
    }],
    address: {
        street: {
            type: String,
            default: null,
        },
        city: {
            type: String,
            default: null,
        },
        state: {
            type: String,
            default: null,
        },
        zip_code: {
            type: String,
            default: null,
        },
        country: {
            type: String,
            default: null,
        },
        phone: {
            type: String,
            default: null,
        },
    },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

export default mongoose.model<IUser>('User', UserSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
    user_id: mongoose.Types.ObjectId;
    product_id: mongoose.Types.ObjectId;
    order_id: mongoose.Types.ObjectId;
    rating: number;
    review_text: string;
    is_verified_purchase: boolean;
    is_visible: boolean;
    created_at: Date;
    updated_at: Date;
}

const ReviewSchema: Schema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    product_id: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    order_id: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: false,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    review_text: {
        type: String,
        required: true,
    },
    is_verified_purchase: {
        type: Boolean,
        default: false,
    },
    is_visible: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

export default mongoose.model<IReview>('Review', ReviewSchema);

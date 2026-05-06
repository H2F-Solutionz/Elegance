import mongoose, { Schema, Document } from 'mongoose';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';

export interface IOrder extends Document {
    user_id: mongoose.Types.ObjectId;
    product_id: mongoose.Types.ObjectId;
    quantity: number;
    total_amount: number;
    status: OrderStatus;
    email?: string;
    phone?: string;
    delivery_address?: string;
    created_at: Date;
    updated_at: Date;
}

const OrderSchema: Schema = new Schema({
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
    quantity: {
        type: Number,
        required: true,
        default: 1,
    },
    total_amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'],
        default: 'pending',
    },
    email: {
        type: String,
        default: null,
    },
    phone: {
        type: String,
        default: null,
    },
    delivery_address: {
        type: String,
        default: null,
    },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

export default mongoose.model<IOrder>('Order', OrderSchema);

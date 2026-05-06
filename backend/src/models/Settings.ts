import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
    payment_methods: {
        stripe: boolean;
        paypal: boolean;
        cod: boolean; // Cash on Delivery
    };
    updated_at: Date;
}

const SettingsSchema: Schema = new Schema({
    payment_methods: {
        stripe: {
            type: Boolean,
            default: true,
        },
        paypal: {
            type: Boolean,
            default: false,
        },
        cod: {
            type: Boolean,
            default: true,
        },
    },
}, {
    timestamps: { updatedAt: 'updated_at' },
});

export default mongoose.model<ISettings>('Settings', SettingsSchema);

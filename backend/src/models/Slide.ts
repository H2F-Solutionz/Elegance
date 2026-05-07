import mongoose, { Schema, Document } from 'mongoose';

export interface ISlide extends Document {
    title: string;
    subtitle: string;
    description: string;
    image: string;
    cta: string;
    link: string;
    order: number;
    active: boolean;
    created_at: Date;
    updated_at: Date;
}

const SlideSchema: Schema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        subtitle: { type: String, default: '', trim: true },
        description: { type: String, default: '', trim: true },
        image: { type: String, required: true },
        cta: { type: String, default: 'Shop Now', trim: true },
        link: { type: String, default: '/', trim: true },
        order: { type: Number, default: 0 },
        active: { type: Boolean, default: true },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

export default mongoose.model<ISlide>('Slide', SlideSchema);

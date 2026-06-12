import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description?: string;
  category?: string;
  price?: number;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String },
    description: { type: String },
    category: { type: String },
    price: { type: Number },
    stock: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

const productSchemaV2 = new Schema<IProduct>(
  {
    name: { type: String },
    description: { type: String },
    category: { type: String },
    price: { type: Number },
    stock: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

export const Product = mongoose.model<IProduct>('Product', productSchema);
export const ProductV2 = mongoose.model<IProduct>('ProductV2', productSchemaV2);

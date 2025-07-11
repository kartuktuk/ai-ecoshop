import mongoose from 'mongoose';

export interface IProduct extends mongoose.Document {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  brand: string;
  countInStock: number;
  rating: number;
  numReviews: number;
  carbonFootprint: number;
  sustainabilityScore: number;
  materials: string[];
}

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  countInStock: {
    type: Number,
    required: true,
    default: 0,
  },
  rating: {
    type: Number,
    required: true,
    default: 0,
  },
  numReviews: {
    type: Number,
    required: true,
    default: 0,
  },
  carbonFootprint: {
    type: Number,
    required: true,
    default: 0,
  },
  sustainabilityScore: {
    type: Number,
    required: true,
    default: 0,
  },
  materials: [{
    type: String,
    required: true,
  }],
}, {
  timestamps: true,
});

export const Product = mongoose.model<IProduct>('Product', productSchema);

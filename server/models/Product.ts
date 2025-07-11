import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  carbonImpact: number;
  sustainabilityScore: number;
  imageUrl: string;
  blockchainHash: string;
  inStock: boolean;
}

const productSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['clothing', 'food', 'home', 'beauty', 'electronics']
  },
  carbonImpact: {
    type: Number,
    required: [true, 'Carbon impact score is required'],
    min: 0
  },
  sustainabilityScore: {
    type: Number,
    required: [true, 'Sustainability score is required'],
    min: 0,
    max: 100
  },
  imageUrl: {
    type: String,
    required: [true, 'Product image URL is required']
  },
  blockchainHash: {
    type: String,
    required: true,
    unique: true
  },
  inStock: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for searching
productSchema.index({ name: 'text', description: 'text' });

// Virtual for calculating eco-score
productSchema.virtual('ecoScore').get(function() {
  return Math.round((this.sustainabilityScore - this.carbonImpact) * 10) / 10;
});

export const Product = mongoose.model<IProduct>('Product', productSchema);

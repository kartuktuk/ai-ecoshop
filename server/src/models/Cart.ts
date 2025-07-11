import mongoose from 'mongoose';
import { IProduct } from './Product';

export interface ICartItem {
  product: IProduct['_id'];
  quantity: number;
}

export interface ICart extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  totalAmount: number;
}

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
  }],
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
  },
}, {
  timestamps: true,
});

export const Cart = mongoose.model<ICart>('Cart', cartSchema);

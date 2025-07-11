import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { IProduct } from './Product';

interface ICartItem {
  product: IProduct['_id'];
  quantity: number;
}

export interface ICart extends Document {
  user: IUser['_id'];
  items: ICartItem[];
}

const cartSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    }
  }]
}, {
  timestamps: true
});

// Index for quick lookup by user
cartSchema.index({ user: 1 });

export const Cart = mongoose.model<ICart>('Cart', cartSchema);

import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { IProduct } from './Product';

interface IOrderItem {
  product: IProduct['_id'];
  quantity: number;
  price: number;
  carbonImpact: number;
}

export interface IOrder extends Document {
  user: IUser['_id'];
  items: IOrderItem[];
  totalPrice: number;
  totalCarbon: number;
  tokensEarned: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

const orderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
    },
    price: {
      type: Number,
      required: true
    },
    carbonImpact: {
      type: Number,
      required: true
    }
  }],
  totalPrice: {
    type: Number,
    required: true
  },
  totalCarbon: {
    type: Number,
    required: true
  },
  tokensEarned: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  }
}, {
  timestamps: true
});

// Index for querying user orders
orderSchema.index({ user: 1, createdAt: -1 });

export const Order = mongoose.model<IOrder>('Order', orderSchema);

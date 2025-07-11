import express from 'express';
import { protect } from '../utils/auth';
import { Order } from '../models/Order';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import asyncHandler from 'express-async-handler';

const router = express.Router();

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, asyncHandler(async (req: any, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Calculate total carbon footprint
  let totalCarbonFootprint = 0;
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (product) {
      totalCarbonFootprint += product.carbonFootprint * item.quantity;
    }
  }

  const order = new Order({
    orderItems,
    user: req.user._id,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    totalPrice,
    totalCarbonFootprint,
  });

  const createdOrder = await order.save();

  // Clear the user's cart after successful order
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { items: [], totalAmount: 0 }
  );

  res.status(201).json(createdOrder);
}));

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, asyncHandler(async (req: any, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (order && (order.user._id.toString() === req.user._id.toString() || req.user.isAdmin)) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
}));

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
router.put('/:id/pay', protect, asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
}));

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, asyncHandler(async (req: any, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
}));

export default router;

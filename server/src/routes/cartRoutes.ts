import express from 'express';
import { protect } from '../utils/auth';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import asyncHandler from 'express-async-handler';

const router = express.Router();

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
router.get('/', protect, asyncHandler(async (req: any, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

  if (cart) {
    res.json(cart);
  } else {
    const newCart = await Cart.create({ user: req.user._id, items: [], totalAmount: 0 });
    res.json(newCart);
  }
}));

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
router.post('/', protect, asyncHandler(async (req: any, res) => {
  const { productId, quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (quantity > product.countInStock) {
    res.status(400);
    throw new Error('Product out of stock');
  }

  if (cart) {
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity = quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    // Recalculate total amount
    const populatedCart = await cart.populate('items.product');
    cart.totalAmount = populatedCart.items.reduce(
      (total, item: any) => total + item.quantity * item.product.price,
      0
    );

    const updatedCart = await cart.save();
    res.json(await updatedCart.populate('items.product'));
  } else {
    const newCart = await Cart.create({
      user: req.user._id,
      items: [{ product: productId, quantity }],
      totalAmount: product.price * quantity,
    });

    res.status(201).json(await newCart.populate('items.product'));
  }
}));

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
router.delete('/:productId', protect, asyncHandler(async (req: any, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (cart) {
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== req.params.productId
    );

    // Recalculate total amount
    const populatedCart = await cart.populate('items.product');
    cart.totalAmount = populatedCart.items.reduce(
      (total, item: any) => total + item.quantity * item.product.price,
      0
    );

    const updatedCart = await cart.save();
    res.json(await updatedCart.populate('items.product'));
  } else {
    res.status(404);
    throw new Error('Cart not found');
  }
}));

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
router.delete('/', protect, asyncHandler(async (req: any, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (cart) {
    cart.items = [];
    cart.totalAmount = 0;
    const updatedCart = await cart.save();
    res.json(updatedCart);
  } else {
    res.status(404);
    throw new Error('Cart not found');
  }
}));

export default router;

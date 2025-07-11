import { Request, Response } from 'express';
import { User } from '../models/User';
import { Order } from '../models/Order';
import { AppError } from '../utils/errorHandler';
import asyncHandler from 'express-async-handler';

// Token earning rate: 1 token per 10% below average carbon impact
const TOKEN_RATE = 0.1;

// @desc    Get user's carbon footprint stats
// @route   GET /api/footprint
// @access  Private
export const getCarbonFootprint = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  // Get user's orders
  const orders = await Order.find({ user: req.user._id })
    .populate('items.product', 'name carbonImpact sustainabilityScore');

  // Calculate total carbon impact and sustainability score
  const stats = orders.reduce((acc, order) => {
    order.items.forEach(item => {
      const product = item.product as any;
      acc.totalCarbon += product.carbonImpact * item.quantity;
      acc.totalSustainability += product.sustainabilityScore * item.quantity;
      acc.totalItems += item.quantity;
    });
    return acc;
  }, {
    totalCarbon: 0,
    totalSustainability: 0,
    totalItems: 0
  });

  // Get average carbon impact per item
  const averageCarbonPerItem = stats.totalItems > 0 
    ? stats.totalCarbon / stats.totalItems 
    : 0;

  // Get all orders for comparison
  const allOrders = await Order.find().populate('items.product', 'carbonImpact');
  
  let globalTotalCarbon = 0;
  let globalTotalItems = 0;

  allOrders.forEach(order => {
    order.items.forEach(item => {
      const product = item.product as any;
      globalTotalCarbon += product.carbonImpact * item.quantity;
      globalTotalItems += item.quantity;
    });
  });

  const globalAverageCarbonPerItem = globalTotalItems > 0 
    ? globalTotalCarbon / globalTotalItems 
    : 0;

  // Calculate carbon savings and tokens earned
  const carbonSavings = globalAverageCarbonPerItem - averageCarbonPerItem;
  const percentageReduction = globalAverageCarbonPerItem > 0 
    ? (carbonSavings / globalAverageCarbonPerItem) * 100 
    : 0;
  
  // Update user's carbon footprint and tokens
  const user = await User.findById(req.user._id);
  if (user) {
    user.carbonFootprint = stats.totalCarbon;
    if (percentageReduction > 0) {
      const newTokens = Math.floor(percentageReduction * TOKEN_RATE);
      user.greenTokens += newTokens;
      await user.save();
    }
  }

  res.json({
    personalStats: {
      totalCarbon: stats.totalCarbon,
      averageCarbonPerItem,
      totalItems: stats.totalItems,
      averageSustainability: stats.totalItems > 0 
        ? stats.totalSustainability / stats.totalItems 
        : 0
    },
    comparison: {
      globalAverageCarbonPerItem,
      carbonSavings,
      percentageReduction,
      ranking: percentageReduction > 0 ? 'Below Average' : 'Above Average'
    },
    rewards: {
      greenTokens: user?.greenTokens || 0,
      lastEarned: Math.floor(percentageReduction * TOKEN_RATE)
    }
  });
});

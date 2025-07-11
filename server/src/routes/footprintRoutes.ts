import express from 'express';
import { protect } from '../utils/auth';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import asyncHandler from 'express-async-handler';

const router = express.Router();

// @desc    Calculate product carbon footprint
// @route   GET /api/footprint/product/:id
// @access  Public
router.get('/product/:id', asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    // Example footprint calculation based on materials and product category
    // In a real application, this would use more sophisticated calculations
    const materialFootprint = product.materials.length * 0.5; // Base footprint per material
    const categoryMultiplier = getCategoryMultiplier(product.category);
    const totalFootprint = materialFootprint * categoryMultiplier;

    res.json({
      productId: product._id,
      carbonFootprint: totalFootprint,
      sustainabilityScore: calculateSustainabilityScore(totalFootprint),
      breakdownByMaterial: product.materials.map(material => ({
        material,
        footprint: 0.5 * categoryMultiplier,
      })),
    });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
}));

// @desc    Get user's carbon footprint from orders
// @route   GET /api/footprint/user
// @access  Private
router.get('/user', protect, asyncHandler(async (req: any, res) => {
  const orders = await Order.find({ user: req.user._id });

  const totalCarbonFootprint = orders.reduce(
    (total, order) => total + (order.totalCarbonFootprint || 0),
    0
  );

  // Calculate monthly breakdown
  const monthlyFootprint = new Map();
  orders.forEach(order => {
    if (order.createdAt) {
      const monthYear = new Date(order.createdAt).toISOString().slice(0, 7); // Format: YYYY-MM
      const current = monthlyFootprint.get(monthYear) || 0;
      monthlyFootprint.set(monthYear, current + (order.totalCarbonFootprint || 0));
    }
  });

  res.json({
    totalCarbonFootprint,
    monthlyBreakdown: Object.fromEntries(monthlyFootprint),
    ordersCount: orders.length,
    averagePerOrder: orders.length > 0 ? totalCarbonFootprint / orders.length : 0,
  });
}));

// Helper functions for carbon footprint calculations
function getCategoryMultiplier(category: string): number {
  const multipliers: { [key: string]: number } = {
    'electronics': 2.0,
    'clothing': 1.5,
    'food': 1.2,
    'books': 0.8,
    'accessories': 1.0,
  };
  return multipliers[category.toLowerCase()] || 1.0;
}

function calculateSustainabilityScore(carbonFootprint: number): number {
  // Example scoring system (0-100)
  // Lower carbon footprint = higher sustainability score
  const maxFootprint = 10; // Example threshold
  const score = Math.max(0, Math.min(100, (1 - carbonFootprint / maxFootprint) * 100));
  return Math.round(score);
}

export default router;

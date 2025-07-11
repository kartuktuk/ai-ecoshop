import express from 'express';
import { protect } from '../utils/auth';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { Order } from '../models/Order';
import asyncHandler from 'express-async-handler';

const router = express.Router();

// @desc    Get personalized product recommendations
// @route   GET /api/recommend
// @access  Private
router.get('/', protect, asyncHandler(async (req: any, res) => {
  // Get user's order history
  const orders = await Order.find({ user: req.user._id }).populate('orderItems.product');

  // Get user's sustainability preferences from their purchase history
  const purchasedProducts: any[] = [];
  orders.forEach((order) => {
    order.orderItems.forEach((item: any) => {
      if (item.product) {
        purchasedProducts.push(item.product);
      }
    });
  });

  // Calculate average sustainability metrics from user's purchases
  let avgSustainabilityScore = 0;
  let avgCarbonFootprint = 0;
  let preferredCategories = new Set();
  let preferredMaterials = new Set();

  if (purchasedProducts.length > 0) {
    avgSustainabilityScore = purchasedProducts.reduce((acc, product) => acc + product.sustainabilityScore, 0) / purchasedProducts.length;
    avgCarbonFootprint = purchasedProducts.reduce((acc, product) => acc + product.carbonFootprint, 0) / purchasedProducts.length;
    purchasedProducts.forEach((product) => {
      preferredCategories.add(product.category);
      product.materials.forEach((material: string) => preferredMaterials.add(material));
    });
  }

  // Get recommendations based on sustainability score and user preferences
  const recommendations = await Product.find({
    $and: [
      { _id: { $nin: purchasedProducts.map(p => p._id) } }, // Exclude already purchased products
      {
        $or: [
          { sustainabilityScore: { $gte: avgSustainabilityScore } },
          { carbonFootprint: { $lte: avgCarbonFootprint } },
          { category: { $in: Array.from(preferredCategories) } },
          { materials: { $in: Array.from(preferredMaterials) } }
        ]
      }
    ]
  }).limit(10);

  res.json(recommendations);
}));

export default router;

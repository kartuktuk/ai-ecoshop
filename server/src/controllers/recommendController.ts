import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { AppError } from '../utils/errorHandler';
import asyncHandler from 'express-async-handler';

// Simple recommendation algorithm based on user preferences and sustainability
const calculateRecommendationScore = (
  product: any,
  preferences: string[],
  averageSustainabilityScore: number,
  averageCarbonImpact: number
) => {
  let score = 0;

  // Base score from sustainability
  score += (product.sustainabilityScore / averageSustainabilityScore) * 50;

  // Penalty for high carbon impact
  score -= (product.carbonImpact / averageCarbonImpact) * 30;

  // Bonus for matching preferences
  if (preferences.includes(product.category)) {
    score += 20;
  }

  return score;
};

// @desc    Get recommended products for user
// @route   GET /api/recommend
// @access  Private
export const getRecommendations = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  // Get user preferences
  const userPreferences = req.user.preferences;

  // Get all in-stock products
  const products = await Product.find({ inStock: true });

  if (!products.length) {
    throw new AppError('No products available', 404);
  }

  // Calculate averages for normalization
  const averageSustainabilityScore = products.reduce((acc, product) => 
    acc + product.sustainabilityScore, 0) / products.length;
  const averageCarbonImpact = products.reduce((acc, product) => 
    acc + product.carbonImpact, 0) / products.length;

  // Calculate scores for each product
  const scoredProducts = products.map(product => ({
    ...product.toObject(),
    recommendationScore: calculateRecommendationScore(
      product,
      userPreferences,
      averageSustainabilityScore,
      averageCarbonImpact
    )
  }));

  // Sort by score and get top 5
  const recommendations = scoredProducts
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 5);

  res.json({
    recommendations,
    metrics: {
      averageSustainabilityScore,
      averageCarbonImpact
    }
  });
});

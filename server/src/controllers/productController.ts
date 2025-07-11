import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { AppError } from '../utils/errorHandler';
import asyncHandler from 'express-async-handler';
import crypto from 'crypto';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const pageSize = 12;
  const page = Number(req.query.page) || 1;
  const category = req.query.category as string;
  const search = req.query.search as string;
  const minSustainability = Number(req.query.minSustainability) || 0;

  const query: any = {};

  if (category) {
    query.category = category;
  }

  if (search) {
    query.$text = { $search: search };
  }

  if (minSustainability) {
    query.sustainabilityScore = { $gte: minSustainability };
  }

  const count = await Product.countDocuments(query);
  const products = await Product.find(query)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ sustainabilityScore: -1 });

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    total: count
  });
});

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    throw new AppError('Product not found', 404);
  }
});

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const {
    name,
    description,
    price,
    category,
    carbonImpact,
    sustainabilityScore,
    imageUrl
  } = req.body;

  // Generate mock blockchain hash
  const blockchainHash = crypto
    .createHash('sha256')
    .update(`${name}-${Date.now()}`)
    .digest('hex');

  const product = await Product.create({
    name,
    description,
    price,
    category,
    carbonImpact,
    sustainabilityScore,
    imageUrl,
    blockchainHash
  });

  if (product) {
    res.status(201).json(product);
  } else {
    throw new AppError('Invalid product data', 400);
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const {
    name,
    description,
    price,
    category,
    carbonImpact,
    sustainabilityScore,
    imageUrl,
    inStock
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.carbonImpact = carbonImpact || product.carbonImpact;
    product.sustainabilityScore = sustainabilityScore || product.sustainabilityScore;
    product.imageUrl = imageUrl || product.imageUrl;
    product.inStock = inStock !== undefined ? inStock : product.inStock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    throw new AppError('Product not found', 404);
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } else {
    throw new AppError('Product not found', 404);
  }
});

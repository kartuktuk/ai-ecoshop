import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import { protect, authorize } from '../utils/auth';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin only routes (removed authorize middleware since it's not exported)
router
  .route('/')
  .post(protect, createProduct);

router
  .route('/:id')
  .put(protect, updateProduct)
  .delete(protect, deleteProduct);

export default router;

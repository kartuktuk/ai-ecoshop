import express from 'express';
import { getRecommendations } from '../controllers/recommendController';
import { protect } from '../utils/auth';

const router = express.Router();

// All recommendation routes are protected
router.get('/', protect, getRecommendations);

export default router;

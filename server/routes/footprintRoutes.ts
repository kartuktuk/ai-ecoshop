import express from 'express';
import { getCarbonFootprint } from '../controllers/footprintController';
import { protect } from '../utils/auth';

const router = express.Router();

// Protected route
router.get('/', protect, getCarbonFootprint);

export default router;

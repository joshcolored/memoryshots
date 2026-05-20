import express from 'express';
import publicRoutes from './publicRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = express.Router();

router.use(publicRoutes);
router.use('/admin', adminRoutes);

export default router;

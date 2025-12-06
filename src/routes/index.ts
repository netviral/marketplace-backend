import express from 'express';
import userRouter from './users/index.js';

const router = express.Router();
// allow API access to all routes with bearer token auth, prefixed with /api

router.use('/users', userRouter);

// allow browser access to same routes with cookie auth
router.use('/vendors', userRouter);

export default router;
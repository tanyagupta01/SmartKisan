import express from 'express';
import voiceChatRoute from './voiceChatRoute.js';
import imageRoute from './imageRoute.js';
import calenderRoute from './calenderRoute.js'
import marketRoute from './marketRoute.js'

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString() 
  });
});

// Mount route modules
router.use('/', voiceChatRoute);
router.use('/', imageRoute);
router.use('/', calenderRoute);
router.use('/', marketRoute)

export default router;
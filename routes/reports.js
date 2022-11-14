const express = require('express');
const router = express.Router();
const controller = require('../controllers/reports');

// Middleware to protect the route
const auth = require('../middleware/auth');
router.use(auth.verifySignIn);

router.get('/', controller.serveDashboard);
router.get('/invlevel', controller.getCurrentInventory);
router.get('/cogs', controller.serveCOGS);
router.post('/cogs', controller.searchCOGS);

router.get('/topsellers', controller.queryTopSellers);
router.post('/topsellers', controller.queryTopSellers);

module.exports = router;
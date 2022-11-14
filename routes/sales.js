const express = require('express');
const router = express.Router();
const controller = require('../controllers/sales');

// Middleware to protect the route
const auth = require('../middleware/auth');
router.use(auth.verifySignIn)

router.get('/', controller.serveRoot);
router.post('/', controller.recordSale);

router.get('/search', controller.serveSearch);
router.post('/search', controller.search);

module.exports = router;
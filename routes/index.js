const express = require('express');
const router = express.Router();
const indexController = require('../controllers/index');

// Middleware to protect the route
const auth = require('../middleware/auth');
//router.use(auth.verifySignIn) Enable to protect the full route

// ROUTES
router.get('/', auth.verifySignIn, indexController.getRoot);
router.get('/login', indexController.serveLogin);
router.post('/login', indexController.authUser);
router.get('/logout', indexController.logOut);

router.get('/register', indexController.serveRegister);
router.post('/register', indexController.registerUser);

router.get('/suppliers', auth.verifySignIn, indexController.getSuppliers);
router.post('/suppliers', auth.verifySignIn, indexController.addSupplier);

router.post('/test', auth.verifySignIn, indexController.testPost);
router.post('/testConsole', auth.verifySignIn, indexController.testConsole);

module.exports = router;
const express = require("express");
const router = express.Router();
const controller = require("../controllers/purchases");

// Middleware to protect the route
const auth = require("../middleware/auth");
router.use(auth.verifySignIn)

// ROUTES
router.get("/", controller.main);
router.get("/new", controller.new);
router.post("/", controller.recordPurchase);

router.post('/search', controller.search)

router.get("/outstanding", controller.serveOutstanding);
router.post("/outstanding", controller.recordPayment);

module.exports = router;

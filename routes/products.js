const express = require("express");
const router = express.Router();
const controller = require("../controllers/products");

// Middleware to protect the route
const auth = require("../middleware/auth");
router.use(auth.verifySignIn)

// ROUTES
router.get("/", controller.getAllProducts);
router.get("/new", controller.newProduct);
router.post("/new", controller.addProduct);

router.get("/:id/edit", controller.editProduct);
router.get("/:id", controller.productReport);
router.post("/:id", controller.updateProduct);

module.exports = router;
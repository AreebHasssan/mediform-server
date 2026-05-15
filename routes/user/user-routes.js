const express = require("express");
const {
  getFilteredProducts,
  getProductDetails,
} = require("../../controllers/user/product-controller");
const { createOrder } = require("../../controllers/user/order-controller");

const router = express.Router();

router.get("/get", getFilteredProducts);
router.get("/get/:id", getProductDetails);
router.post("/order", createOrder);

module.exports = router;

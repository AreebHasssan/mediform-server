const express = require("express");
const router = express.Router();
const productRouter = require("./product");
const dashboardRouter = require("./dashboard");
const orderRouter = require("./order");

// Admin routes
router.use("/products", productRouter);
router.use("/dashboard", dashboardRouter);
router.use("/orders", orderRouter);

module.exports = router;

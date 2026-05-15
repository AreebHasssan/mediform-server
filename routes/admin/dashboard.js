const express = require("express");
const { getDashboardStats } = require("../../controllers/admin/dashboard-controller");

const router = express.Router();

router.get("/stats", getDashboardStats);

module.exports = router;

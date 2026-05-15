const express = require("express");
const {
  addProduct,
  fetchAllProducts,
  editProduct,
  deleteProduct,
} = require("../../controllers/admin/product");
const { upload } = require("../../helpers/cloudinary");

const router = express.Router();

// 'images' is the field name used in FormData on the frontend
router.post("/add", upload.array("images", 10), addProduct);
router.get("/get", fetchAllProducts);
router.put("/edit/:id", upload.array("images", 10), editProduct);
router.delete("/delete/:id", deleteProduct);

module.exports = router;

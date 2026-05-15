const { imageUploadUtil } = require("../../helpers/cloudinary");
const Product = require("../../model/admin/product");

const addProduct = async (req, res) => {
  try {
    const { title, description, category, brand, price, salePrice, form, totalStock } = req.body;
    const files = req.files;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Please select a category",
      });
    }

    if (!form || !["Tablet", "Syrup", "Capsule", "Drops", "Schets"].includes(form)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid Dosage Form (Tablet, Syrup, Capsule, Drops, or Schets)",
      });
    }

    // Convert strings to numbers and provide defaults
    const parsedPrice = parseFloat(price) || 0;
    const parsedSalePrice = parseFloat(salePrice) || 0;
    const parsedStock = parseInt(totalStock) || 0;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one image",
      });
    }

    const imageUrls = [];
    for (const file of files) {
      try {
        const b64 = Buffer.from(file.buffer).toString("base64");
        const url = "data:" + file.mimetype + ";base64," + b64;
        const result = await imageUploadUtil(url);
        if (result && result.secure_url) {
          imageUrls.push(result.secure_url);
        } else {
          throw new Error("Cloudinary upload failed");
        }
      } catch (uploadError) {
        throw uploadError;
      }
    }

    const newlyCreatedProduct = new Product({
      title,
      description,
      category,
      brand,
      price: parsedPrice,
      salePrice: parsedSalePrice,
      form,
      totalStock: parsedStock,
      images: imageUrls,
    });

    await newlyCreatedProduct.save();

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      data: newlyCreatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error occurred while adding product",
    });
  }
};

const fetchAllProducts = async (req, res) => {
  try {
    const listOfProducts = await Product.find({});
    res.status(200).json({
      success: true,
      data: listOfProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching products",
    });
  }
};

const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, brand, price, salePrice, form, totalStock } = req.body;
    const files = req.files;

    // Convert strings to numbers
    const parsedPrice = price !== undefined ? parseFloat(price) : undefined;
    const parsedSalePrice = salePrice !== undefined ? parseFloat(salePrice) : undefined;
    const parsedStock = totalStock !== undefined ? parseInt(totalStock) : undefined;

    let findProduct = await Product.findById(id);
    if (!findProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    findProduct.title = title || findProduct.title;
    findProduct.description = description || findProduct.description;
    findProduct.category = category || findProduct.category;
    findProduct.brand = brand || findProduct.brand;
    findProduct.form = form || findProduct.form;
    
    if (parsedPrice !== undefined) findProduct.price = parsedPrice;
    if (parsedSalePrice !== undefined) findProduct.salePrice = parsedSalePrice;
    if (parsedStock !== undefined) findProduct.totalStock = parsedStock;

    // If new images are uploaded, update them
    if (files && files.length > 0) {
      const imageUploadPromises = files.map((file) => {
        const b64 = Buffer.from(file.buffer).toString("base64");
        const url = "data:" + file.mimetype + ";base64," + b64;
        return imageUploadUtil(url);
      });

      const uploadedImages = await Promise.all(imageUploadPromises);
      const imageUrls = uploadedImages.map((img) => img.secure_url);
      findProduct.images = imageUrls;
    }

    await findProduct.save();
    res.status(200).json({
      success: true,
      data: findProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error occurred while editing product",
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error occurred while deleting product",
    });
  }
};

module.exports = {
  addProduct,
  fetchAllProducts,
  editProduct,
  deleteProduct,
};

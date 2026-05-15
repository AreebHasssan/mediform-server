const Product = require("../../model/admin/product");

const getFilteredProducts = async (req, res) => {
  try {
    const { category, sortBy = "price", order = "asc", search = "", form } = req.query;
 
     let filters = {};
     if (category) {
       filters.category = category;
     }

     if (form) {
       filters.form = form;
     }

    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    let sort = {};
    if (sortBy === "name") {
      sort.title = order === "asc" ? 1 : -1;
    } else {
      sort[sortBy] = order === "asc" ? 1 : -1;
    }

    const products = await Product.find(filters).sort(sort);

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

module.exports = { getFilteredProducts, getProductDetails };

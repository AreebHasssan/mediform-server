const Product = require("../../model/admin/product");
const Order = require("../../model/shop/order");

const getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({});
    
    const orders = await Order.find({ orderStatus: "delivered" });
    const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);

    const products = await Product.find({});
    const totalQuantity = products.reduce((acc, prod) => acc + (prod.totalStock || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalRevenue,
        totalQuantity,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching dashboard stats",
    });
  }
};

module.exports = { getDashboardStats };

const Order = require("../../model/shop/order");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY || "re_123");

const getAllOrdersOfAllUsers = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("userId", "userName email")
      .sort({ createdAt: -1 });

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

const getOrderDetailsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate("userId", "userName email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findById(id).populate("userId", "userName email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    order.orderStatus = orderStatus;
    await order.save();

    // If delivered, send email to the email address provided in addressInfo
    const customerEmail = order.addressInfo?.email || order.userId?.email;
    const customerName = order.addressInfo?.name || order.userId?.userName || "Customer";

    if (orderStatus === "delivered" && customerEmail) {
      try {
        await resend.emails.send({
          from: "Mediformers Pharmacy <onboarding@resend.dev>",
          to: customerEmail,
          subject: 'Order Delivered! - Mediformers',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
              <h2 style="color: #0d9488; text-align: center;">Your Order has been Delivered!</h2>
              <p>Hello <b>${customerName}</b>,</p>
              <p>Great news! Your order <b>#${order._id}</b> has been successfully delivered.</p>
              <p>We hope you are satisfied with your purchase. Thank you for choosing Mediformers Pharmacy!</p>
              
              <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <h3 style="margin-top: 0; color: #333;">Order Summary</h3>
                <p style="margin-bottom: 0;">Total Amount Paid: <b>Rs. ${order.totalAmount}</b></p>
              </div>

              <p style="text-align: center; font-size: 12px; color: #999; margin-top: 30px;">
                If you have any questions, please contact our support team.<br>
                &copy; 2026 Mediformers Pharmacy. All rights reserved.
              </p>
            </div>
          `
        });
      } catch (err) {
        console.error("Delivery Email Error:", err);
      }
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully!",
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

module.exports = {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
};

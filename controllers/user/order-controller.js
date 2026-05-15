const Order = require("../../model/shop/order");
const Product = require("../../model/admin/product");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY || "re_123");

const createOrder = async (req, res) => {
  try {
    const { userId, cartItems, addressInfo, totalAmount } = req.body;

    // 1. Stock Verification & Deduction
    for (const item of cartItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.title} not found!`,
        });
      }

      if (product.totalStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${item.title}. Available: ${product.totalStock}`,
        });
      }

      // Deduct stock
      product.totalStock -= item.quantity;
      await product.save();
    }

    // 2. Create Order
    const newlyCreatedOrder = new Order({
      userId,
      cartItems,
      addressInfo,
      totalAmount,
    });

    await newlyCreatedOrder.save();

    // 3. Notify Admin via Email
    try {
      await resend.emails.send({
        from: "Mediformers <onboarding@resend.dev>",
        to: "hsareeb41@gmail.com", // Your personal email to receive alerts
        subject: "New Order Received!",
        html: `
          <h2>New Order #${newlyCreatedOrder._id}</h2>
          <p><b>Customer:</b> ${addressInfo.name}</p>
          <p><b>Total Amount:</b> Rs. ${totalAmount}</p>
          <p><b>Items:</b></p>
          <ul>
            ${cartItems.map(item => `<li>${item.title} (x${item.quantity})</li>`).join("")}
          </ul>
          <p>Check the admin dashboard for details.</p>
        `,
      });
    } catch (err) {
      console.error("Admin Email Error:", err);
    }

    // 4. Notify User via Email (Confirmation)
    try {
      await resend.emails.send({
        from: "Mediformers <onboarding@resend.dev>",
        to: addressInfo.email,
        subject: "Order Placed Successfully - Mediformers",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <h2 style="color: #0d9488; text-align: center;">Order Confirmed!</h2>
            <p>Hello <b>${addressInfo.name}</b>,</p>
            <p>Thank you for shopping with Mediformers. Your order <b>#${newlyCreatedOrder._id}</b> has been placed successfully and is being processed.</p>
            
            <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px;">Order Summary</h3>
            <table style="width: 100%; text-align: left; border-collapse: collapse;">
              <thead>
                <tr style="background: #f9fafb;">
                  <th style="padding: 10px;">Item</th>
                  <th style="padding: 10px;">Qty</th>
                  <th style="padding: 10px;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${cartItems.map(item => `
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">Rs. ${item.price}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
            
            <div style="margin-top: 20px; text-align: right;">
              <p style="font-size: 18px; font-weight: bold;">Total Amount: <span style="color: #0d9488;">Rs. ${totalAmount}</span></p>
            </div>
            
            <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px;">Shipping Details</h3>
            <p style="font-size: 14px; color: #666;">
              ${addressInfo.address}<br>
              ${addressInfo.province}, ${addressInfo.country}<br>
              Phone: ${addressInfo.phone}
            </p>
            
            <p style="text-align: center; font-size: 12px; color: #999; margin-top: 30px;">
              This is an automated email. Please do not reply.
            </p>
          </div>
        `,
      });
    } catch (err) {
      console.error("User Email Error:", err);
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      orderId: newlyCreatedOrder._id,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

module.exports = { createOrder };

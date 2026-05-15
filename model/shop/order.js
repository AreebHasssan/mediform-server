const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cartItems: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        title: String,
        image: String,
        price: Number,
        quantity: Number,
      },
    ],
    addressInfo: {
      name: String,
      email: String,
      phone: String,
      country: String,
      province: String,
      address: String,
    },
    orderStatus: {
      type: String,
      default: "pending",
      enum: ["pending", "inProcess", "inShipping", "delivered", "rejected"],
    },
    paymentMethod: String,
    paymentStatus: String,
    totalAmount: Number,
    orderDate: {
      type: Date,
      default: Date.now,
    },
    orderUpdateDate: Date,
    paymentId: String,
    payerId: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);

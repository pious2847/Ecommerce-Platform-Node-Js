const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  total_amount: {
    type: Number,
    default: 0
  },
  quantity: {
    type: Number,
    default: 1
  },
  totalcost: {
    type: Number,
    default: 0
  }
},
  { timestamps: true }
);

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;

const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
require("../database/database");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  image:{
    type: String,
    default: ' '
  },
  address: {
    phone: {
      type: String,
    },
    House_address: {
      type: String,
    },
    city: {
      type: String,
    },
    country: {
      type: String,
    },
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },

  cart: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart'
  }]
},
{ timestamps: true }
);

const User = mongoose.model("users", userSchema);

module.exports = User;

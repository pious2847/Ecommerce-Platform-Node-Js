const mongoose = require("mongoose");
require("../database/database");

const productSchema = new mongoose.Schema({
  Title: {
    type: String,
    required: true,
  },
  Price: {
    type: Number,
    required: true,
  },
  Description: {
    type: String,
    default:"Not Found",
  },
  Image: {
    type: String,

  },
  Rate: {
    type: Number,

  },
  Category:{
    type: String,
    required: true
  },
  Brand: {
    type: String,
  }
},
{ timestamps: true }
);

var Product = mongoose.model("Product", productSchema);

module.exports = Product;

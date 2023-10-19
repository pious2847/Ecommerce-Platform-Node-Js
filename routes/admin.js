const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const User = require('../models/user');
const Cart = require("../models/cart");
const Order = require('../models/order')


const { isLoggedIn, isAdmin } = require('../authenticate/auth')


router.get('/admin/all-products', isAdmin, isLoggedIn, async (req, res) => {
  const alertMessage = req.flash("alertMessage");
  const alertStatus = req.flash("alertStatus");

  const alert = { message: alertMessage, status: alertStatus };

  // Retrieve the cart for the logged-in user and populate the 'product' field
  const userId = req.session.userId;
  const cart = await Cart.findOne({ user: userId });


  let count = 0;
  // Calculate the total count of products in the cart
  count = cart.length;

  try {

    // Retrieve page number and limit from query parameters (default to page 1 and limit 20)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    // Calculate the skip value based on the page and limit
    const skip = (page - 1) * limit;

    // Fetch products from the database using pagination
    const products = await Product.find().sort({ _id: -1 }).skip(skip).limit(limit);

    // Calculate the total number of pages
    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);

    // Render the 'products.ejs' template and pass the product data
    res.render("./admin/all_products", {
      products, currentPage: page,
      totalPages, isAdmin: req.session.isAdmin, totalcount: count, alert
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products." });
  }
})

router.get('/admin/dashboard', isAdmin, isLoggedIn, async (req, res) => {
  const alertMessage = req.flash("alertMessage");
  const alertStatus = req.flash("alertStatus");

  const alert = { message: alertMessage, status: alertStatus };
  // Retrieve the cart for the logged-in user and populate the 'product' field
  const userId = req.session.userId;
  const cart = await Cart.findOne({ user: userId });

  const orders = await Order.find().populate('product').find({user: userId});


  let count = 0;
  if (cart) {
    // Calculate the total count of products in the cart
    count = cart.length;
  }

  try {

    const procount = await Product.countDocuments({})

    const usercount = await User.countDocuments({});

    // Fetch all products from the database
    const products = await Product.find().sort({ _id: -1 });
    const user = await User.find().sort({ name: -1 });

    // Render the 'products.ejs' template and pass the product data
    res.render('./admin/product', { totalCount: count, productcount: procount, usertotal: usercount, products, orders,user, isAdmin: req.session.isAdmin, totalcount: count, alert });
  } catch (error) {
    req.flash("alertMessage", "Error retrieving product count");
    req.flash("alertStatus", "danger");
    return res.redirect("/admin/add-product");


  }
})
router.get('/admin/add-product', isAdmin, isLoggedIn, async (req, res) => {
  const alertMessage = req.flash("alertMessage");
  const alertStatus = req.flash("alertStatus");

  const alert = { message: alertMessage, status: alertStatus };

  // Retrieve the cart for the logged-in user and populate the 'product' field
  const userId = req.session.userId;
  const cart = await Cart.findOne({ user: userId });


  let count = 0;
  if (cart) {
    // Calculate the total count of products in the cart
    count = cart.length;
  }

  res.render('./admin/add_product', { isAdmin: req.session.isAdmin, totalcount: count, alert })
})


router.get('/admin/edit-product', isAdmin, isLoggedIn, async (req, res) => {
  const alertMessage = req.flash("alertMessage");
  const alertStatus = req.flash("alertStatus");

  const alert = { message: alertMessage, status: alertStatus };

  // Retrieve the cart for the logged-in user and populate the 'product' field
  const userId = req.session.userId;
  const cart = await Cart.findOne({ user: userId }).sort({ _id: -1 });


  let count = 0;
  if (cart) {
    // Calculate the total count of products in the cart
    count = cart.length;
  }

  try {
    // Retrieve page number and limit from query parameters (default to page 1 and limit 20)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    // Calculate the skip value based on the page and limit
    const skip = (page - 1) * limit;

    // Fetch products from the database using pagination
    const products = await Product.find().sort({ _id: -1 }).skip(skip).limit(limit);

    // Calculate the total number of pages
    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);

    // Render the 'edit_product.ejs' template and pass the product data, isAdmin status, total count, alert messages, and pagination variables
    res.render("./admin/edit_product", {
      products,
      isAdmin: req.session.isAdmin,
      totalcount: count,
      alert,
      currentPage: page,
      totalPages,
    });

    // // Fetch all products from the database
    // const products = await Product.find().sort({ _id: -1 });

    // Render the 'products.ejs' template and pass the product data
    // res.render("./admin/edit_product", { products , isAdmin: req.session.isAdmin , totalcount:count , alert});
  } catch (error) {
    req.flash("alertMessage", "Failed to fetch products.");
    req.flash("alertStatus", "danger");
    return res.redirect("/admin/dashboard");
  }

})



module.exports = router
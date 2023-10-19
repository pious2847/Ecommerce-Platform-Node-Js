const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const User = require('../models/user')
const Cart = require('../models/cart')

const { isLoggedIn, isAdmin } = require('../authenticate/auth');
const { Query } = require("mongoose");


router.get("/", isLoggedIn, async (req, res) => {
  const alertMessage = req.flash("alertMessage");
  const alertStatus = req.flash("alertStatus");

  const alert = { message: alertMessage, status: alertStatus };
  // Retrieve the cart for the logged-in user and populate the 'product' field
  const userId = req.session.userId;
  const cart = await Cart.find({ user: userId });


  let count = 0;
  if (cart) {
    // Calculate the total count of products in the cart
    count = cart.length;
  }


  try {
    const user = User.findById(userId)
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



    // Render the 'products.ejs' template and pass the product data
    res.render("home", { title: "Moon Shooping mall", products, currentPage: page, totalPages, isAdmin: req.session.isAdmin, user, totalcount: count, alert });
  } catch (error) {
    req.flash('alertMessage', 'Failed to fetch products');
    req.flash('alertStatus', 'danger');
    res.redirect('/login');

  }
});



router.get("/cartegories", async (req, res) => {
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

  try {

    // Fetch all products from the database
    const products = await Product.find().sort({ _id: -1 });

    res.render("cartegory", { products, isAdmin: req.session.isAdmin, totalcount: count, alert });
  } catch (error) {
    req.flash('alertMessage', 'Failed to fetch products');
    req.flash('alertStatus', 'danger');
    res.redirect('/');

  }

});
router.get('/search/category', async (req, res) => {
  const alertMessage = req.flash("alertMessage");
  const alertStatus = req.flash("alertStatus");

  const alert = { message: alertMessage, status: alertStatus };
  const userId = req.session.userId;
  const cart = await Cart.findOne({ user: userId });

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

    const query = req.query.query;

    const products = await Product.find({ Category: { $regex: query, $options: 'i' } }).sort({ _id: -1 }).skip(skip).limit(limit);

    // Calculate the total number of pages
    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);

    res.render('cartegory_detail', { products, currentPage: page, totalPages, isAdmin: req.session.isAdmin, totalcount: count, alert })

  } catch (error) {

  }
})

router.get('/All/products', isLoggedIn, async (req, res) => {
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


    // Render the 'test1' template and pass the product data and currentPage
    res.render('products', { products, currentPage: page, totalPages, isAdmin: req.session.isAdmin, totalcount: count, alert });
  } catch (error) {
    req.flash('alertMessage', 'Failed to fetch products');
    req.flash('alertStatus', 'danger');
    res.redirect('/');
  }
});
 
// Handle the search request
router.get('/search', isLoggedIn, async (req, res) => {
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

  try {


    const query = req.query.query; // Get the search query from the URL parameter
    const products = await Product.find({ Title: { $regex: query, $options: 'i' } });
    res.render('search', { products, isAdmin: req.session.isAdmin, totalcount: count, alert, query });
  } catch (error) {
    req.flash('alertMessage', 'Error searching for products');
    req.flash('alertStatus', 'danger');
    res.redirect('/');

    // Handle the error appropriately
  }
});
// end of seacrh box codes

router.get('/product-detail/:productId', isLoggedIn, async (req, res) => {
  
  const alertMessage = req.flash("alertMessage");
  const alertStatus = req.flash("alertStatus");
  const alert = { message: alertMessage, status: alertStatus };

  const productId = req.params.productId;
  const cartId = req.params.productId;
  const userId = req.session.userId;

  const cart = await Cart.findOne({ user: userId });

  const user = User.findById(userId);

  try {
    let count = 0;
    let existingProduct = false; // Initialize the variable

    if (cart) {
      count = cart.length;

      const product = await Product.findById(productId);
      if (!product) {
        req.flash('alertMessage', 'Product not found');
        req.flash('alertStatus', 'danger');
        return res.redirect('/');
      }

      const relatedProducts = await Product.find({ _id: { $ne: productId }, Rate: { $gt: 3 } });

      res.render('detail-page', { product, relatedProducts, isAdmin: req.session.isAdmin, totalcount: count, alert, user, cart, existingProduct });
    } 

  } catch (error) {
    console.error(error);
    req.flash('alertMessage', 'Internal server error');
    req.flash('alertStatus', 'danger');
    res.redirect('/');
  }
});


module.exports = router;

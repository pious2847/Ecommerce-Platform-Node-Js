const express = require("express");
const router = express.Router();

const Cart = require("../models/cart");
const Product = require("../models/product");
const User = require('../models/user')
const { isLoggedIn, isAdmin } = require('../authenticate/auth')

router.get('/cart', isLoggedIn, async (req, res) => {
  const alertMessage = req.flash("alertMessage");
  const alertStatus = req.flash("alertStatus");

  const alert = { message: alertMessage, status: alertStatus };
  try {

    // Retrieve the cart for the logged-in user and populate the 'product' field
    const userId = req.session.userId;
    const carts = await Cart.find({ user: userId }).populate('product'); // Add .populate('product') here
   

    let totalCost = 0;
    carts.forEach((cartProduct) => {
      totalCost += cartProduct.total_amount;
    });
    carts.totalcost = totalCost;

    // Save the updated or n
    const user = await req.session.userId;
    if (!user) {
      req.flash('alertMessage', 'User not found');
      req.flash('alertStatus', 'danger');
      return res.redirect('/login');
    }
    let count = 0;
    if (carts) {
      // Calculate the total count of products in the cart
      count = carts.length;
    }
    // Render the 'cart' template and pass the populated cart data
    res.render('Cart', { carts, user, isAdmin: req.session.isAdmin, totalcount: count, alert, });
  } catch (error) {
    console.log(error);
    req.flash("alertMessage", "Failed to fetch cart products.");
    req.flash("alertStatus", "danger");
    return res.redirect("/");

  }
});



// Add item to cart
router.post('/add-cart/:productId', isLoggedIn, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.session.userId;
    const quantity = req.body.quantity || 1;

    // Retrieve the product from the database
    const product = await Product.findById(productId);

    // Check if a cart exists for the user
    let cart = await Cart.findOne({ user: userId }).populate('product');

    // Calculate the total cost for all items in the cart
    let totalCost = 0;
    
    // If the cart doesn't exist, create a new one
    cart = new Cart({
      user: userId,
      product: product._id,
      total_amount: product.Price * quantity,
      quantity: quantity,
      totalcost: totalCost,
    });

    // Save the updated or new cart to the database
    await cart.save();



    req.flash('alertMessage', 'Product added to cart.');
    req.flash('alertStatus', 'success');
    res.redirect('/');

  } catch (error) {
    console.error(error);
    req.flash('alertMessage', 'Failed to add product to cart.');
    req.flash('alertStatus', 'danger');
    res.redirect('/All/products');
  }
});

// Delete route for removing a cart item
router.get('/remove-cart/:cartId', isLoggedIn, async (req, res) => {
  try {
    const cartId = req.params.cartId;
    
    // Find the cart item by its ID and ensure it belongs to the logged-in user
    const cart = await Cart.findOne({ _id: cartId, user: req.session.userId });
    
    if (!cart) {
      req.flash('alertMessage', 'Cart item not found.');
      req.flash('alertStatus', 'danger');
      return res.redirect('/cart');
    }
    
    // Delete the cart item
    await cart.deleteOne();
    
    req.flash('alertMessage', 'Cart item successfully removed.');
    req.flash('alertStatus', 'success');
    return res.redirect('/cart');
  } catch (error) {
    console.log(error);
    req.flash('alertMessage', 'Failed to delete cart item.');
    req.flash('alertStatus', 'danger');
    return res.redirect('/cart');
  }
});




module.exports = router;

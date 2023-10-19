const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const multer = require('multer')
const User = require("../models/user");
const Cart = require("../models/cart");
const Order = require("../models/order");
const Product = require("../models/product");
const path = require('path');
const mongoose = require('mongoose')

const { isLoggedIn, isAdmin } = require('../authenticate/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/uploads/user_profile")
  },
  filename: (req, file, cb) => {

    cb(null, file.fieldname + "_" + Date.now() + "_" + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
});

router.get("/sign-up", async (req, res) => {
  const alertMessage = req.flash("alertMessage");
  const alertStatus = req.flash("alertStatus");

  const alert = { message: alertMessage, status: alertStatus };
  const products = await Product.find().sort({ _id: -1 });

  res.render("sign-up", { alert, products });
});

router.get("/login", async (req, res) => {
  const alertMessage = req.flash("alertMessage");
  const alertStatus = req.flash("alertStatus");

  const alert = { message: alertMessage, status: alertStatus };
  const products = await Product.find().sort({ _id: -1 });

  try {

    res.render("login", { alert, products });
  }
  catch (err) {
    console.log(err)
  }
});

router.get('/user/profile', isLoggedIn, async (req, res) => {
  const alertMessage = req.flash('alertMessage');
  const alertStatus = req.flash('alertStatus');
  const alert = { message: alertMessage, status: alertStatus };

  try {
    const userId = req.session.userId;
    const cart = await Cart.findOne({ user: userId });
    const user = await User.findById(userId);
    
    if (!user) {
      req.flash('alertMessage', 'User not found');
      req.flash('alertStatus', 'danger');
      return res.redirect('/login');
    }

    const orders = await Order.find({ userId: userId }).populate('product').sort({ createdAt: -1 });
    let count = 0;
    if(cart){
      count = cart.length || 0;
    }

    console.log('User:', user);
    console.log('Orders:', orders);

    res.render('user_profile', { user, isAdmin: req.session.isAdmin, alert, totalcount: count, orders });
  } catch (error) {
    console.error(error);
    req.flash('alertMessage', 'Internal Server Error');
    req.flash('alertStatus', 'danger');
    res.redirect('/login');
  }
});



router.post('/update_profile/:userId', upload.single('image'), async (req, res) => {

  const userId = req.params.userId;
  const image = req.file ? req.file.filename : req.body.old_image;
  const { name, email, phone, houseAddress, city, country } = req.body



  try {
    const user = await User.findById(userId)

    if (!user) {
      req.flash('alertMessage', 'User Id Not found');
      req.flash('alertStatus', 'danger');
      res.redirect('/user/profile');
    } else {
      user.name = name;
      user.email = user.email;
      user.image = image;
      user.address.phone = phone;
      user.address.House_address = houseAddress;
      user.address.city = city;
      user.address.country = country;

      await user.save();
      req.flash('alertMessage', 'Profile updated successfully');
      req.flash('alertStatus', 'success');
      res.redirect('/user/profile');
    }

  } catch (err) {
    console.log(err);
    req.flash('alertMessage', 'Failed to update profile');
    req.flash('alertStatus', 'danger');
    res.redirect('/user/profile');
  }
});
router.post("/signUp", upload.single("image"), async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ name });
    if (existingUser) {
      req.flash("alertMessage", "Username Already Exist");
      req.flash("alertStatus", "danger");
      return res.redirect("/sign-up");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name: name,
      email: email,
      password: hashedPassword,
      address: {
        phone: ' ',
        House_address: ' ',
        city: ' ',
        country: ' ',
      },
    });

    await user.save();
    req.session.userId = user;
    req.session.isLoggedIn = true;
    req.session.isAdmin = user.isAdmin;
    console.log("Record saved successfully");

    req.flash("alertMessage", "Account Created successfully");
    req.flash("alertStatus", "success");

    res.redirect("/");
  } catch (error) {
    console.error(error);
    req.flash("alertMessage", "An error occurred during registration");
    req.flash("alert status", "danger");
    res.redirect("/sign-up");
  }
});

router.post("/login", async (req, res) => {
  const {email, password,rememberMe} = req.body;


  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      req.flash('alertMessage', 'Invalid username or password');
      req.flash('alertStatus', 'danger');
      return res.redirect('/login');
    }
      // If "Remember Me" is checked during login, set a longer session expiration time
  if (rememberMe) {
    req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
  }
    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      req.flash('alertMessage', 'Incorrect Password Entered ');
      req.flash('alertStatus', 'danger');
      return res.redirect('/login');
    }

    // Set the user ID in the session
    req.session.userId = user;
    req.session.isLoggedIn = true
    req.session.isAdmin = user.isAdmin;

    req.flash('alertMessage', 'User Login Successfully');
    req.flash('alertStatus', 'success');

    // Redirect to the desired page after successful login
    res.redirect('/'); // Replace with the actual dashboard route

  } catch (error) {
    console.error(error);
    req.flash('alertMessage', 'An error occurred during login');
    req.flash('alertStatus', 'danger');
    res.redirect('/login');
  }

});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

module.exports = router;

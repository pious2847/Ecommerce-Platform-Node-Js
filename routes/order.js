const express = require('express');
const router = express.Router();
const Product = require("../models/product");
const User = require("../models/user");
const Cart = require("../models/cart");
const Order = require("../models/order");
const nodemailer = require('nodemailer')

const stripe = require('stripe')('sk_test_51Mx8pPFqzuKlQuBh8qU2Dz4Kunw1U0KxWQn2vyUpOWJHO2UGxjrapVQAYhXQtZOIw0rsOn0Cux6cruEz7iy6GiaK0068E2ILdM');


// Create a transporter object with Gmail SMTP details
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'abdulhafis2847@gmail.com',
    pass: 'xbgvjeegbqifzjns',
  },
});

router.post('/buy-product/:productId', async (req, res) => {

  const { productId } = req.params;

  const { phone, house_address, city, country } = req.body;
  const userId = req.session.userId;

  try {
    const cart = await Cart.findOne({ user: userId });

    // Find the product by its ID
    const product = await Product.findById(productId);
    if (!product) {
      return res.redirect('/');
    }
    // Find the user by their ID
    const user = await User.findById(userId);
    if (!user) {
      req.flash('alertMessage', 'User not found please login');
      req.flash('alertStatus', 'danger');
      return res.redirect('/login');
    }

    // Update the shipping address in the user's address field
    user.address.phone = phone;
    user.address.House_address = house_address;
    user.address.city = city;
    user.address.country = country;

    await user.save();

    // Calculate the total amount based on the product price and quantity
    const totalquantity = req.body.quantity;

    quantity = parseInt(totalquantity);
    // Convert the product price from GHS to USD
    const exchangeRate = 0.089;
    const productPriceInUSD = product.Price * exchangeRate;
    const totalAmount = productPriceInUSD * quantity;


    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.Title,
              description: product.Description,
              images: [product.Image],

            },
            unit_amount: parseInt(totalAmount),
          },
          quantity: quantity,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:8080/',
      cancel_url: 'http://localhost:8080/cart',
    });

    // Set up the email data
    const mailOptions = {
      from: 'abdulhafis2847@gmail.com',
      to: user.email, // Assuming you want to send the response to the user's email
      subject: `Purschase of ${product.Title}`,
      text: `Hi ${user.name},\n\nThank you for shopping with Us. We have received your order an these will be processed for shipping:\n\n Product Name: ${product.Title}\n\n Price: ${product.price} \n\n Quantiy Purchase: ${quantity} \n\n Total Cost: ${totalAmount} \n\n Best regards,\n Moon Shoping Mall`,

    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error:', error);
        res.status(500).send('An error occurred while sending the email.');
      } else {
        console.log('Email sent:', info.response);
        res.status(200).send('Email sent successfully.');
      }
    });


    // Create the order
    const order = await Order.findOne({ user: userId });
    if (order) {
      order.product = product._id;
      order.quantity = quantity;
      order.totalcost = totalAmount;
    } else {
      const newOrder = new Order({
        user: userId,
        product: product._id,
        quantity: quantity,
        totalcost: totalAmount,
      });
      await newOrder.save();
    }


    // Remove the product from the cart
    if (cart && cart.product.toString() === productId) {
      await cart.remove();
    }

    res.redirect(303, session.url);
  } catch (error) {
    console.log(error);
    req.flash('alertMessage', 'An error occurred with our connection to Stripe');
    req.flash('alertStatus', 'danger');
    return res.redirect('/');
  }
});

router.post('/buy-cartproduct/:productId', async (req, res) => {

  const { productId } = req.params;

  const { phone, house_address, city, country , buyall} = req.body;
  const userId = req.session.userId;

  try {

    // Find the user by their ID
    const user = await User.findById(userId);
    if (!user) {
      req.flash('alertMessage', 'User not found plee login');
      req.flash('alertStatus', 'danger');
      return res.redirect('/login');
    }

    // Update the shipping address in the user's address field
    user.address.phone = phone;
    user.address.House_address = house_address;
    user.address.city = city;
    user.address.country = country;

    await user.save();
    const cart = await Cart.findOne({ user: userId }).populate('product');

    // Calculate the total amount based on the product price and quantity
    let quantity = 0;
    const totalquantity = req.body.quantity;
    quantity = parseInt(totalquantity);

    // Convert the product price from GHS to USD
    const exchangeRate = 0.089;
    const productPriceInUSD = cart.product.Price * exchangeRate;
    const totalAmount = productPriceInUSD * quantity;

    if(buyall){
      const session = await stripe.checkout.sessions.create({

        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: "All Products",
                description:' Buy all the products in the cart',
                images: [`http://localhost:8080/uploads/${cart.product.Image}`],
  
              },
              unit_amount: cart.totalcost,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: 'http://localhost:8080/',
        cancel_url: 'http://localhost:8080/cart',
      });
    }

    const session = await stripe.checkout.sessions.create({

      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: cart.product.Title,
              description: cart.product.Description,
              images: [`http://localhost:8080/uploads/${cart.product.Image}`],

            },
            unit_amount: Math.round(productPriceInUSD * 100),
          },
          quantity: parseInt(cart.quantity),
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:8080/',
      cancel_url: 'http://localhost:8080/cart',
    });


    // Create the order
    const order = await Order.findOne({ user: userId });
    if (order) {
      order.product = cart.product._id;
      order.quantity = cart.quantity;
      order.totalcost = cart.total_amount;
    } else {
      const newOrder = new Order({
        user: userId,
        product: cart.product._id,
        quantity: cart.quantity,
        totalcost: cart.total_amount,
      });
      await newOrder.save();
    }

    // Set up the email data
    const mailOptions = {
      from: 'abdulhafis2847@gmail.com',
      to: user.email, // Assuming you want to send the response to the user's email
      subject: `Purschase of ${cart.product.Title}`,
      text: `Hi ${user.name},\n\nThank you for your shopping with Us. We have received your order an these will be processed for shipping:\n\n Product Name: ${cart.product.Title}\n\n Price: ${cart.product.price} \n\n Quantiy Purchase: ${cart.quantity} \n\n Total Cost: ${cart.total_amount} \n\n Best regards,\n Moon Shoping Mall`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error:', error);
        res.status(500).send('An error occurred while sending the email.');
      } else {
        console.log('Email sent:', info.response);
        res.status(200).send('Email sent successfully.');
      }
    });

    // Remove the product from the cart
    if (cart && cart.product.toString() === productId) {
      await cart.remove();
    }

    res.redirect(303, session.url);
  } catch (error) {
    console.log(error);
    req.flash('alertMessage', 'An error occurred with our connection to Stripe');
    req.flash('alertStatus', 'danger');
    return res.redirect('/');
  }
});


module.exports = router;
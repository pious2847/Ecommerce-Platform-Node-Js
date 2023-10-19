const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Product = require("../models/product");
const Cart = require("../models/cart");
const fs = require("fs");

const { isLoggedIn, isAdmin } = require("../authenticate/auth");
const { error, Console } = require("console");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/uploads");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + "_" + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
});

router.post("/uploadProduct", upload.single("image"), isAdmin, (req, res) => {
  const alertMessage = req.flash("alertMessage");
  const alertStatus = req.flash("alertStatus");

  const alert = { message: alertMessage, status: alertStatus };

  const title = req.body.title;
  const price = req.body.price;
  const description = req.body.description;
  const image = req.file.filename;
  const rate = req.body.rate;
  const category = req.body.category;
  const brand = req.body.brand;

  const product = new Product({
    Title: title,
    Price: price,
    Description: description,
    Image: image,
    Rate: rate,
    Category: category,
    Brand: brand,
  });

  product
    .save()

    .then((sucess) => {
      req.flash("alertMessage", "Product Inserted successfully");
      req.flash("alertStatus", "success");

      console.log("Product Inserted Sucessfully");
    })
    .then((newProduct) => {
      res.redirect("/admin/add-product");
    });
});

// Remove Product
router.get("/deleteProduct/:productId", isAdmin, async (req, res) => {
  try {
    const productId = req.params.productId;

    // Find the product by ID in the database
    const product = await Product.findById(productId);

    const imageFileName = product.Image;
    const imagePath = path.join(
      __dirname,
      "../public/uploads/" + imageFileName
    );

    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log("Image file deleted");
      }
    });

    // Find the product by ID and delete it
    await Product.findByIdAndDelete(productId);

    req.flash("alertMessage", "Product deleted successfully");
    req.flash("alertStatus", "success");

    res.redirect("/admin/all-products");
    
  } catch (error) {
    req.flash("alertMessage", "Failed to delete product");
    req.flash("alertStatus", "danger");
    res.redirect("/admin/edit-product");
  }
});


// GET route to render the update form
router.get("/updateProduct/:productId", isAdmin, async (req, res) => {
  const alertMessage = req.flash("alertMessage");
  const alertStatus = req.flash("alertStatus");

  const alert = { message: alertMessage, status: alertStatus };

  const productId = req.params.productId;

  try {
    const product = await Product.findById(productId);
    const count = await Cart.countDocuments({});

    res.render("./admin/update_product", {
      product,
      isAdmin: req.session.isAdmin,
      totalcount: count,
      alert,
    });
  } catch (error) {
    console.error("Failed to fetch product for update:", error);
    res.status(500).send("Failed to fetch product for update");
  }
});

router.post("/updateProduct/:productId", upload.single("image"), isAdmin, async (req, res) => {
  try {
    const productId = req.params.productId;
    const { title, price, description, rate, category, brand } = req.body;
    const newImage = req.file ? req.file.filename : req.body.old_image;
    
    const product = await Product.findById(productId);

    if (!product) {
      req.flash("alertMessage", "Product not found");
      req.flash("alertStatus", "danger");
      return res.redirect("/admin/edit-product");
    }

    // Remove the old image if a new image is uploaded
    if (newImage && newImage !== product.Image) {
      const imageFileName = product.Image;
      const imagePath = path.join(
        __dirname,
        "../public/uploads/" + imageFileName
      );
  
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log("Image file deleted");
        }
      });
    }else{
    
    product.Title = title;
    product.Price = price;
    product.Description = description;
    product.Image = newImage;
    product.Rate = rate;
    product.Category = category;
    product.Brand = brand;

    await product.save();

    req.flash("alertMessage", "Product updated successfully");
    req.flash("alertStatus", "success");

    res.redirect("/admin/edit-product");
    }

  
  } catch (error) {
    console.error(error);
    req.flash("alertMessage", "Failed to update product");
    req.flash("alertStatus", "danger");
    res.redirect("/admin/dashboard");
  }
});


module.exports = router;

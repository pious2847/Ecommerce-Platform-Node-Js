const User = require('../models/user')

// Check if user is logged in
const isLoggedIn = (req, res, next) => {
  if (req.session && req.session.userId) {
    // User is logged in
    next();
  } else {
    // User is not logged in, redirect to login page or handle the unauthorized access
    req.flash("alertMessage", "Please login to acess page");
    req.flash("alertStatus", "danger");
    req.flash('message', {type: 'danger', text: ''})
    res.redirect('/login');
  }
};

// Check if user is an admin
const isAdmin = (req, res, next) => {
  if (req.session && req.session.userId) {
    User.findById(req.session.userId)
      .then(user => {
        if (user && user.isAdmin === true) {
          // User is logged in and is an admin
          next();
        } else {
          // User is not an admin, redirect to login page or handle the unauthorized access
          req.flash("alertMessage", "Please login as admin");
          req.flash("alertStatus", "danger");
          res.redirect('/login');
        }
      })
      .catch(err => {
        // Error occurred while fetching the user, handle it appropriately
        res.redirect('/login');
      });
  } else {
    // User is not logged in, redirect to login page or handle the unauthorized access
    res.redirect('/login');
  }
};

// Protect a route with JWT authentication middleware
const authenticateJWT = (req, res, next) => {
    const token = req.session.token;
  
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    jwt.verify(token, 'your-secret-key', (err, decodedToken) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid token' });
      }
  
      // Attach the user ID to the request object
      req.userId = decodedToken.userId;
      next();
    });
  }

module.exports = { isLoggedIn, isAdmin,authenticateJWT };

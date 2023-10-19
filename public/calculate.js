// main.js

// Function to calculate the total price of products in the cart
function calculateTotalPrice(cart) {
    let totalPrice = 0;
    if (cart && cart.product && cart.product.length > 0) {
      cart.product.forEach((product) => {
        totalPrice += product.price * product.quantity;
      });
    }
    return totalPrice.toLocaleString();
  }
  
  // Function to update the total price element with the calculated value
  function updateTotalPrice(cart) {
    const totalPriceElement = document.getElementById('total-price');
    if (totalPriceElement) {
      const totalPrice = calculateTotalPrice(cart);
      totalPriceElement.textContent = totalPrice;
    }
  }
  
  // Function to fetch the cart data and update the total price element
  function fetchCartAndUpdateTotalPrice() {
    fetch('/cart')
      .then((response) => response.json())
      .then((data) => {
        const cart = data.cart;
        updateTotalPrice(cart);
      })
      .catch((error) => console.error(error));
  }
  
  // Call the fetchCartAndUpdateTotalPrice function on page load
  document.addEventListener('DOMContentLoaded', fetchCartAndUpdateTotalPrice);
  
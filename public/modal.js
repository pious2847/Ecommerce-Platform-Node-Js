const modal = document.querySelector(".modal");
const show_modal = document.querySelectorAll('.show_modal');
const close_btn = document.querySelector(".close_btn");

let selectProductId = null; // Variable to store the selected product ID

show_modal.forEach(sdm => {
  if (modal) {
    sdm.addEventListener('click', (event) => {
      event.preventDefault();
      selectProductId = sdm.getAttribute('data-product-id');
      console.log(selectProductId);
      modal.classList.remove('hide_modal');
    });
  }

  close_btn.addEventListener("click", () => {
    modal.classList.add("hide_modal");
    selectProductId = null; // Reset the selected product ID
  });

  const yesButton = modal.querySelector('.yes');
  if (yesButton) {
    yesButton.addEventListener('click', () => {
      if (selectProductId) {
        deleteProduct(selectProductId); // Call the function to delete the product
      }
      modal.classList.add('hide_modal');
    });
  }
});

// Function to delete the product
function deleteProduct(productId) {
  // Make an AJAX request to the server to delete the product
  fetch(`/buy-product/${productId}`, {
    method: 'GET',
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Product deleted successfully
        // You can perform any necessary UI updates here (e.g., remove the deleted product from the table)
        console.log("Product deleted successfully");
        window.location.href = "/"; // Redirect to the admin dashboard
      } else {
        // Failed to delete the product
        // Handle the error or display an error message to the user
        console.error("Failed to delete the product");
      }
    })
    .catch(error => {
      // Handle any network or server errors
      console.error(error);
    });
}

// const modal = document.querySelector(".modal");
// const show_modal = document.querySelectorAll('.show_modal')
// const close_btn = document.querySelector(".close_btn");



// show_modal.forEach(sdm=>{

//     if (modal) {
//         sdm.addEventListener('click',()=>{
//           modal.classList.remove('hide_modal')
//         });
//         close_btn.addEventListener("click", () => {
//           modal.classList.add("hide_modal");
//         });
      
      
//       }
// })

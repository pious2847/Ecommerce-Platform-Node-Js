
// Add to Cart AJAX request
$(document).on('click', '.addToCart', function() {
    var productId = $(this).data('productId');
  
    $.ajax({
      url: '/add-to-cart',
      method: 'POST',
      data: { productId: productId },
      success: function(response) {
        alert(response.message);
      },
      error: function(xhr, status, error) {
        console.log(error);
      }
    });
  });
  
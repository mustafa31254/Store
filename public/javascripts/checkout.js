
$(function() {

   Stripe.setPublishableKey('pk_test_rHPnQstYMeqVLoplDI3dWuv2');
  var $form = $('#payment-form');
  $form.submit(function(event) {
    // Disable the submit button to prevent repeated clicks:
    $form.find('.submit').prop('disabled', true);

    // Request a token from Stripe:
    Stripe.card.createToken($form, stripeResponseHandler);

    // Prevent the form from being submitted:
    return false;
  });
});
function stripeResponseHandler(status, response) {
  // Grab the form:
  var $form = $('#payment-form');

  if (response.error) { // Problem!

    // Show the errors on the form:
    $form.find('.payment-errors').text(response.error.message);
    $form.find('.submit').prop('disabled', false); // Re-enable submission

  } else { // Token was created!

    // Get the token ID:
    var token = response.id;

    // Insert the token ID into the form so it gets submitted to the server:
    $form.append($('<input type="hidden" name="stripeToken">').val(token));

    // Submit the form:
    $form.get(0).submit();
  }
};



// $(function() {
// Stripe.setPublishableKey('pk_test_rHPnQstYMeqVLoplDI3dWuv2');
// var $form=$("#checkout-form");

// $form.submit(function(event){
//   event.preventDefault();
//     $('#charge-error').addClass("hidden")
// $form.find('button').prop('disabled', true);

// Stripe.card.createToken({
//   number: $('#card-number').val(),
//   cvc: $('#card-cvc').val(),
//   exp_month: $('#card-expiry-month').val(),
//   exp_year: $('#card-expiry-year').val(),
//   name: $('#card-name').val()
// }, stripeResponseHandler);
// return false;

// });
// function stripeResponseHandler(status, response) {

//   // Grab the form:
 

//   if (response.error) { // Problem!

//     // Show the errors on the form
//     $('#charge-error').text(response.error.message);
//     $('#charge-error').removeClass("hidden");
//     $form.find('button').prop('disabled', false); // Re-enable submission

//   } else { // Token was created!


//     // Get the token ID:
//     var token = response.id;

//     // Insert the token into the form so it gets submitted to the server:
//     $form.append($('<input type="hidden" name="stripeToken" />').val(token));

//     // Submit the form:
//     //  $($form.get(0)).submit();
//     $form.get(0).submit();

//   }
// }
// });
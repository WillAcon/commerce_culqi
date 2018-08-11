/**
 * @file
 * Javascript to generate Stripe token in PCI-compliant way.
 */

(function ($, Drupal, drupalSettings) {

  'use strict';

  /**
   * Attaches the commerceStripeForm behavior.
   *
   * @type {Drupal~behavior}
   *
   * @prop object cardNumber
   *   Stripe card number element.
   * @prop object cardExpiry
   *   Stripe card expiry element.
   * @prop object cardCvc
   *   Stripe card cvc element.
   * @prop {Drupal~behaviorAttach} attach
   *   Attaches the commerceStripeForm behavior.
   * @prop {Drupal~behaviorDetach} detach
   *   Detaches the commerceStripeForm behavior.
   *
   * @see Drupal.commerceStripe
   */
  Drupal.behaviors.commerceStripeForm = {
    cardNumber: null,
    cardExpiry: null,
    cardCvc: null,

    attach: function (context) {
      var self = this;
      if (!drupalSettings.commerceStripe || !drupalSettings.commerceStripe.publishableKey) {
        return;
      }
      $('.culqi-form', context).once('culqi-processed').each(function () {
        var $form = $(this).closest('form');

        // Clear the token every time the payment form is loaded. We only need the token
        // one time, as it is submitted to Stripe after a card is validated. If this
        // form reloads it's due to an error; received tokens are stored in the checkout pane.
        $('#culqi_token', $form).val('');

        // Create a Stripe client.
        /* global Stripe */
        var culqi = Stripe(drupalSettings.commerceStripe.publishableKey);

        // Create an instance of Stripe Elements.
        var elements = culqi.elements();
        var classes = {
          base: 'form-text',
          invalid: 'error'
        };
        // Create instances of the card elements.
        self.cardNumber = elements.create('cardNumber', {
          classes: classes
        });
        self.cardExpiry = elements.create('cardExpiry', {
          classes: classes
        });
        self.cardCvc = elements.create('cardCvc', {
          classes: classes
        });
        // Add an instance of the card UI components into the "scard-element" element <div>
        self.cardNumber.mount('#card-number-element');
        self.cardExpiry.mount('#expiration-element');
        self.cardCvc.mount('#security-code-element');

        // Input validation.
        self.cardNumber.on('change', function (event) {
          culqiErrorHandler(event);
        });
        self.cardExpiry.on('change', function (event) {
          culqiErrorHandler(event);
        });
        self.cardCvc.on('change', function (event) {
          culqiErrorHandler(event);
        });

        // Insert the token ID into the form so it gets submitted to the server
        var culqiTokenHandler = function (token) {
          // Set the Stripe token value.
          $('#culqi_token', $form).val(token.id);

          // Submit the form.
          $form.get(0).submit();
        };

        // Helper to handle the Stripe responses with errors.
        var culqiErrorHandler = function (result) {
          if (result.error) {
            // Inform the user if there was an error.
            culqiErrorDisplay(result.error.message);
          }
          else {
            // Clean up error messages.
            $form.find('#payment-errors').html('');
          }
        };

        // Helper for displaying the error messages within the form.
        var culqiErrorDisplay = function (error_message) {
          // Display the message error in the payment form.
          $form.find('#payment-errors').html(Drupal.theme('commerceStripeError', error_message));

          // Allow the customer to re-submit the form.
          $form.find('button').prop('disabled', false);
        };

        // Create a Stripe token and submit the form or display an error.
        var culqiCreateToken = function () {
          culqi.createToken(self.cardNumber).then(function (result) {
            if (result.error) {
              // Inform the user if there was an error.
              culqiErrorDisplay(result.error.message);
            }
            else {
              // Send the token to your server.
              culqiTokenHandler(result.token);
            }
          });
        };

        // Form submit.
        $form.on('submit.commerce_culqi', function (e) {
          // Disable the submit button to prevent repeated clicks.
          $form.find('button').prop('disabled', true);

          // Try to create the Stripe token and submit the form.
          culqiCreateToken();

          // Prevent the form from submitting with the default action.
          if ($('#card-number-element', $form).length) {
            return false;
          }
        });
      });
    },

    detach: function (context, settings, trigger) {
      if (trigger !== 'unload') {
        return;
      }
      var self = this;
      ['cardNumber', 'cardExpiry', 'cardCvc'].forEach(function (i) {
        if (self[i] && self[i].length > 0) {
          self[i].unmount();
          self[i] = null;
        }
      });
      var $form = $('.culqi-form', context).closest('form');
      if ($form.length === 0) {
        return;
      }
      $form.off('submit.commerce_culqi');
    }
  };

  $.extend(Drupal.theme, /** @lends Drupal.theme */{
    commerceStripeError: function (message) {
      return $('<div class="messages messages--error"></div>').html(message);
    }
  });

})(jQuery, Drupal, drupalSettings);

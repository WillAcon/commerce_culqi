/**
 * @file
 * Javascript to generate Culqi token in PCI-compliant way.
 */

(function ($, Drupal, drupalSettings) {

  'use strict';

  /**
   * Attaches the commerceCulqiForm behavior.
   *
   * @type {Drupal~behavior}
   *
   * @prop object cardNumber
   *   Culqi card number element.
   * @prop object cardExpiry
   *   Culqi card expiry element.
   * @prop object cardCvc
   *   Culqi card cvc element.
   * @prop {Drupal~behaviorAttach} attach
   *   Attaches the commerceCulqiForm behavior.
   * @prop {Drupal~behaviorDetach} detach
   *   Detaches the commerceCulqiForm behavior.
   *
   * @see Drupal.commerceCulqi
   */

  Drupal.behaviors.commerceCulqiForm = {
    cardNumber: null,
    cardExpiry: null,
    cardCvc: null,

    anotherFunction: function() {
      // console.log("funcion---");
    },

    attach: function (context) {
      var self = this;
      if (!drupalSettings.commerceCulqi || !drupalSettings.commerceCulqi.publishableKey) {
        return;
      }

       var url_post = drupalSettings.commerceCulqi.url_post;
       Culqi.publicKey = drupalSettings.commerceCulqi.publishableKey;
       var amount =  drupalSettings.commerceCulqi.amount;

       Culqi.settings({
            title: drupalSettings.commerceCulqi.title,
            currency: drupalSettings.commerceCulqi.currency,
            description: drupalSettings.commerceCulqi.description,
            amount: drupalSettings.commerceCulqi.amount,
            parame_id:"33333"
        });

       $('.payment-culqi').on('click', function (e) {
         
         Culqi.open();
         e.preventDefault();
      });

       function culqi() {
        // console.log("load culqi fun xxxxxxxxx");

        $(document).ajaxStart(function(){
              run_waitMe();
        });

        if (Culqi.token) { // ¡Token creado exitosamente!
            // Get the token ID:
            var token = Culqi.token.id;
            // console.log("Culqi", Culqi);

             // var url = "/commerce_culqi/dummy_redirect_post?_format_json";
        
             var  data = {
                    "source_id": Culqi.token.id,
                    "amount": drupalSettings.commerceCulqi.amount,
                    "currency_code": drupalSettings.commerceCulqi.currency,
                    "email": Culqi.token.email,
                    "return": drupalSettings.commerceCulqi.return,
                    "client": drupalSettings.commerceCulqi.client
                  };

                jQuery.post(url_post, data).done(function(response){
                      // console.log("response", response);
                       // $('body').waitMe('hide');

              // $response_data['validate'] = true;
              // $response_data['txn_id'] = $param['id'];
              // $response_data['authorization_code'] = $param['authorization_code'];
              // $response_data['payment_status'] = $param['outcome']['type'];

                      if(response['validate']) {
                        // window.location.href = drupalSettings.commerceCulqi.return;
                        var data = {
                          txn_id: response['txn_id'],
                          authorization_code: response['authorization_code'],
                          payment_status: response['payment_status'],
                        }
                        setTimeout(function() {
                          jQuery.redirect(drupalSettings.commerceCulqi.return,data, "POST");   
                        }, 100);
                        
                      }
                      else {
                        $('body').waitMe('hide');
                        alert("Error al procesar el pago, vuelva a intentarlo por favor.");
                      }
                });


            // $.ajax({
            //     url: url_post,
            //     data: JSON.stringify({
            //         "source_id": Culqi.token.id,
            //         "amount": drupalSettings.commerceCulqi.amount,
            //         "currency_code": drupalSettings.commerceCulqi.currency,
            //         "email": Culqi.token.email
            //     }),
            //     contentType: "application/json",
            //     headers: {
            //         "Accept": "application/json",
            //     },
            //     error: function (err) {
            //         alert('Lo sentimos, a ocurrido un error');
            //     },
            //     dataType: 'json',
            //     success: function (data) {
            //         console.log("data", data);
            //         // alert("pago exitoso")
            //     },
            //     type: 'POST'
            // });

           /* $.ajax({
                url: 'https://api.culqi.com/v2/charges',
                data: JSON.stringify({
                    "source_id": Culqi.token.id,
                    "amount": 3500,
                    "currency_code": "PEN",
                    "email": Culqi.token.email
                }),
                contentType: "application/json",
                headers: {
                    "Accept": "application/json",
                    "authorization": "Bearer sk_test_zSx3B7eZVHivsFQy"
                },
                error: function (err) {
                    alert('Lo sentimos, a ocurrido un error');
                },
                dataType: 'json',
                success: function (data) {
                    console.log(data);
                    alert("pago exitoso")
                },
                type: 'POST'
            });*/

        } else { // ¡Hubo algún problema!
            // Mostramos JSON de objeto error en consola
            // console.log(Culqi.error);
            alert(Culqi.error.mensaje);
        }
    };

    // function demouno(){

    //   console.log("Culqi",Culqi);
    // }

     window.culqi = culqi;


     
    },

    detach: function (context, settings, trigger) {
      // if (trigger !== 'unload') {
      //   return;
      // }
      // var self = this;
      // ['cardNumber', 'cardExpiry', 'cardCvc'].forEach(function (i) {
      //   if (self[i] && self[i].length > 0) {
      //     self[i].unmount();
      //     self[i] = null;
      //   }
      // });
      // var $form = $('.Culqi-form', context).closest('form');
      // if ($form.length === 0) {
      //   return;
      // }
      // $form.off('submit.commerce_Culqi');
    }
  };

  $.extend(Drupal.theme, /** @lends Drupal.theme */{
    commerceCulqiError: function (message) {
      return $('<div class="messages messages--error"></div>').html(message);
    }
  });

})(jQuery, Drupal, drupalSettings);


function run_waitMe(message){
      jQuery('body').waitMe({
        effect: 'orbit',
        text: message ? message : 'Procesando pago...',
        bg: 'rgba(255,255,255,0.7)',
        color:'#28d2c8'
      });
}


// function culqi(){

//   console.log("Culqi",Culqi);
// }

//  jQuery.ajax({
//                 url: "/commerce_culqi/dummy_redirect_post",
//                 data: {
//                     "source_id": "dddd",
//                     "amount": 3500,
//                     "currency_code": "PEN",
//                     "email": "emqil"
//                 },
//                 contentType: "application/json",
//                 headers: {
//                     "Accept": "application/json",
//                 },
//                 error: function (err) {
//                     alert('Lo sentimos, a ocurrido un error');
//                 },
//                 dataType: 'json',
//                 success: function (data) {
//                     console.log(data);
// //                     alert("pago exitoso")
//                 },
//                 type: 'POST'
//             });


 // jQuery(document).ajaxStart(function(){
 //            run_waitMe();
 //          });

 //                jQuery(".cancel-pay-culqi").click(function(){
 //        run_waitMe('Cancelando...');
 //      });





          // var  data = {
          //           "source_id": "ssss",
          //           "amount": "ssss",
          //           "currency_code": "ssss",
          //           "email": "ssss",
          //         };

          //       jQuery.post(" /commerce_culqi/dummy_redirect_post", data).done(function(response){
          //             console.log(response);
          //             $('body').waitMe('hide');
          //       });

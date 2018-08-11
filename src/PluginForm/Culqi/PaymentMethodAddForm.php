<?php

namespace Drupal\commerce_culqi\PluginForm\Culqi;

use Drupal\commerce_payment\Exception\PaymentGatewayException;
use Drupal\commerce_payment\PluginForm\PaymentOffsiteForm as BasePaymentOffsiteForm;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;

class PaymentMethodAddForm extends BasePaymentOffsiteForm {

   /**
   * {@inheritdoc}
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {
    $form = parent::buildConfigurationForm($form, $form_state);

    /** @var \Drupal\commerce_payment\Entity\PaymentInterface $payment */
    $payment = $this->entity;
    /** @var \Drupal\commerce_payment\Plugin\Commerce\PaymentGateway\OffsitePaymentGatewayInterface $payment_gateway_plugin */
    $payment_gateway_plugin = $payment->getPaymentGateway()->getPlugin();


    $publishable_key = $payment_gateway_plugin->getConfiguration()['publishable_key'];
    $secret_key = $payment_gateway_plugin->getConfiguration()['secret_key'];

    // ksm($payment_gateway_plugin->getConfiguration());

    // $redirect_method = $payment_gateway_plugin->getConfiguration()['redirect_method'];
    // $remove_js = ($redirect_method == 'post_manual');
     $redirect_method = 'post_manual';
     $remove_js = ($redirect_method == 'post_manual');

    if (in_array($redirect_method, ['post', 'post_manual'])) {
      $redirect_url = Url::fromRoute('commerce_culqi.dummy_redirect_post')->toString();
      $redirect_method = 'post';
    }
  /*  else {
      // Gateways that use the GET redirect method usually perform an API call
      // that prepares the remote payment and provides the actual url to
      // redirect to. Any params received from that API call that need to be
      // persisted until later payment creation can be saved in $order->data.
      // Example: $order->setData('my_gateway', ['test' => '123']), followed
      // by an $order->save().
      $order = $payment->getOrder();
      // Simulate an API call failing and throwing an exception, for test purposes.
      // See PaymentCheckoutTest::testFailedCheckoutWithOffsiteRedirectGet().
      if ($order->getBillingProfile()->get('address')->family_name == 'FAIL') {
        throw new PaymentGatewayException('Could not get the redirect URL.');
      }
      $redirect_url = Url::fromRoute('commerce_culqi.dummy_redirect_302', [], ['absolute' => TRUE])->toString();
    }*/
    $data = [
      'return' => $form['#return_url'],
      'cancel' => $form['#cancel_url'],
      'total' => $payment->getAmount()->getNumber(),
    ];

    $order = $payment->getOrder();
    $redirect_url = Url::fromRoute('commerce_culqi.dummy_redirect_post')->toString();
    ksm($redirect_url);


    

    $form = $this->buildRedirectForm($form, $form_state, $redirect_url, $data, $redirect_method);
    // ksm($form);
    if ($remove_js) {
      // Disable the javascript that auto-clicks the Submit button.
      unset($form['#attached']['library']);
    }

    $order_id = $order->id();
    // $url_return = $form['#return_url'];
    // ksm($order_id);
    $message = '<a class="button is-primary payment-culqi">Pagar ahora</a>';
    $message .= "<a href='/checkout/$order_id/review'>Regresar</a>";
    // $message .= "<a href='$url_return'>Regresar</a>";

    $element = array();
    $element['#attached']['library'][] = 'commerce_culqi/form';
    $element['#attached']['drupalSettings']['commerceCulqi'] = [
      'publishableKey' => $publishable_key,
      'title' => \Drupal::config('system.site')->get('name'),
      'currency' => $payment->getAmount()->getCurrencyCode(),
      'description' => t('Order')." #".$order_id,
      'amount'=> ($payment->getAmount()->getNumber()*100),
      'url_post' => $redirect_url
    ];
    $element['#markup'] = $message;

    return $element;

    // return $form;
  }

}

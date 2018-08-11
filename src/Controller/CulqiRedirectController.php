<?php

namespace Drupal\commerce_culqi\Controller;

use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\RequestStack;



use Drupal\Core\Cache\CacheableJsonResponse;
use Drupal\Core\Cache\CacheableMetadata;


use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

// use Drupal\Core\Controller\ControllerBase;
// use Symfony\Component\DependencyInjection\ContainerInterface;
// use Drupal\Core\Entity\Query\QueryFactory;

/**
 * This is a dummy controller for mocking an off-site gateway.
 */
class CulqiRedirectController implements ContainerInjectionInterface {

  /**
   * The current request.
   *
   * @var \Symfony\Component\HttpFoundation\Request
   */
  protected $currentRequest;

  /**
   * Constructs a new CulqiRedirectController object.
   *
   * @param \Symfony\Component\HttpFoundation\RequestStack $request_stack
   *   The request stack.
   */
  public function __construct(RequestStack $request_stack) {
    $this->currentRequest = $request_stack->getCurrentRequest();
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('request_stack')
    );
  }

  public function post111( Request $request ) {
    
    // This condition checks the `Content-type` and makes sure to 
    // decode JSON string from the request body into array.
     $data = $request->getContent();
     // ksm($request->getParameters());
    if ( 0 === strpos( $request->headers->get( 'Content-Type' ), 'application/json' ) ) {
      $data = json_decode( $request->getContent(), TRUE );
      // $request->request->replace( is_array( $data ) ? $data : [] );
    }

    // $response['data'] = $data;
    // $response['method'] = 'POST';

    return new JsonResponse( $data );
  }

  /**
   * Callback method which accepts POST.
   *
   * @throws \Drupal\commerce\Response\NeedsRedirectException
   */
  public function post() {
    // ksm( $this->currentRequest->request);
    // ksm( $this->currentRequest->request->all());
    // ksm( $this->currentRequest->request->get('source_id'));

    
    
    $response_data= [];
    $response_data =  $this->currentRequest->request->all();//$this->currentRequest->request->parameters;//$_POST['email'];// $this->currentRequest->request->get('data');
   

    $Culqi = new \Culqi\Culqi(array('api_key' => 'sk_test_zSx3B7eZVHivsFQy'));

    ksm($Culqi);

   // Add the node_list cache tag so the endpoint results will update when nodes are
   // updated.
   // $cache_metadata = new CacheableMetadata();
   // $cache_metadata->setCacheTags(['node_list']);

   // Create the JSON response object and add the cache metadata.
   $response = new CacheableJsonResponse($response_data);
   // $response->addCacheableDependency($cache_metadata);

   return $response;

    // $cancel = $this->currentRequest->request->get('cancel');
    // $return = $this->currentRequest->request->get('return');
    // $total = $this->currentRequest->request->get('total');

    // if ($total > 20) {
    //   return new TrustedRedirectResponse($return);
    // }

    // return new TrustedRedirectResponse($cancel);
  }


/*
  if($_POST) {
    header('Content-Type: application/json');
    $path = drupal_get_path('module', 'commerce_culqi');
    include_once dirname(__FILE__).'/vendor/autoload.php';

    if($_POST['token'] == 'cancel') {
      commerce_order_status_update($order, 'canceled');
      $result['message'] = 'ok';
      echo json_encode($result);
      exit();
    }
    else {
        $payment = commerce_payment_method_instance_load($order->data['payment_method']);
        $settings = $payment['settings'];
        $description = t($settings['py_description'], array(
        '@order_id' => $order->order_id,
        ));

        $culqi = new Culqi\Culqi(array('api_key' => $settings['py_api_key']));

        $data = array(
              "amount" => $order->commerce_order_total['und'][0]['amount'],
              "capture" => true,
              "currency_code" => $order->commerce_order_total['und'][0]['currency_code'],
              "description" => $description,
              "email" => $order->mail,
              "installments" => (int)$_POST["installments"],
              "source_id" => $_POST["token"]
          );

          try {
            // Creando Cargo a una tarjeta
            $charge = $culqi->Charges->create($data);

            $param = (array)$charge;
            if(validate_charge($param)) {
              commerce_culqi_send_pay($order, $param);
            }
            // Response
            echo json_encode($charge);
            exit();
          } catch (Exception $e) {

            echo json_encode($e->getMessage());

          }
    }
  }
  else {
    return drupal_not_found();
  }
*/


  /**
   * Callback method which reacts to GET from a 302 redirect.
   *
   * @throws \Drupal\commerce\Response\NeedsRedirectException
   */
  public function on302() {
    $cancel = $this->currentRequest->query->get('cancel');
    $return = $this->currentRequest->query->get('return');
    $total = $this->currentRequest->query->get('total');

    if ($total > 20) {
      return new TrustedRedirectResponse($return);
    }

    return new TrustedRedirectResponse($cancel);
  }

}


// https://www.zonarutoppuden.com/2014/01/naruto-shippuden-117.html
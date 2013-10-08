<?php
	error_reporting(E_ERROR|E_WARNING|E_PARSE);
	header('Access-Control-Allow-Origin: *');
	header("Content-Type:text/plain; charset=UTF-8;");
	define("BASE_DIR", dirname(dirname(dirname(__FILE__))));

	require_once(BASE_DIR . '/include/misc.inc');
	require_once(BASE_DIR . '/include/constant.inc');
	require_once(BASE_DIR . '/include/format.inc');
	require_once(BASE_DIR . '/include/storage.inc');
	require_once(BASE_DIR . '/include/ocp.inc');

	$g_debug = true;

	$_REQUEST = array_merge($_GET, $_POST);
	$output = array();
	try {
		$offers = array();
		$price_avg = rand(51, 59);
		$countries = array('France', 'USA', 'Italy', 'Germany', 'China', 'Spain');

		for ($i = 0; $i < 20; $i++) {
			$tb = (rand(-1, 1) > 0)? 1024 : 1;
			$amount = rand(0, 500) * 1024 * 1024 * 1024 * $tb;
			$min_amount = $amount / rand(1, 10);
			$price = $price_avg + rand(-10, 10);
			$health = rand(0, 10);
			$country = $countries[rand(0, count($countries) - 1)];

			$offers[] = array(
				'amount' => $amount,
				'min_amount' => $min_amount,
				'price' => $price,
				'health' => $health,
				'country' => $country,
			);
		}

		$output['result'] = $offers;
	} catch (Exception $e) {
		$output['error'] = $e->getMessage();
	}
	debug_r('OUTPUT', $output);
	$result = prettyPrint(json_encode($output));
	echo $result;
?>
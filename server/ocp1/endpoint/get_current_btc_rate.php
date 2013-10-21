<?php
	define("SCRIPT_FILE", __FILE__);
	require_once(dirname(dirname(dirname(SCRIPT_FILE))) . '/include/header.inc');

	$_REQUEST = array_merge($_GET, $_POST);
	$output = array();
	try {
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, 'http://bitcoincharts.com/t/weighted_prices.json');
		curl_setopt($ch, CURLOPT_HEADER, 1);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		$result = curl_exec($ch);
		$file_contents = strstr($result,'{'); // get everything starting from first curly bracket
		curl_close($ch);
		$price = 0;
		if ($file_contents) {
			$currency_data = json_decode($file_contents, TRUE);
			$price = $currency_data['EUR']['24h']; // get the 24h-average price
		} else {
			$price = 200;
		}
		$output['result'] = $price;
	} catch (Exception $e) {
		$output['error'] = $e->getMessage();
	}
	debug_r('OUTPUT', $output);
	$result = prettyPrint(json_encode($output));
	echo $result;
?>
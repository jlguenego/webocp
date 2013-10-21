<?php
	define("SCRIPT_FILE", __FILE__);
	require_once(dirname(dirname(dirname(SCRIPT_FILE))) . '/include/header.inc');

	$_REQUEST = array_merge($_GET, $_POST);
	$output = array();
	try {
		$now_t = time();
		$offers = array();
		$rate_avg = rand(51, 59);
		$countries = array('France', 'USA', 'Italy', 'Germany', 'China', 'Spain');

		for ($i = 0; $i < 20; $i++) {
			$size = rand(100, 10000);
			$min_size = $size / rand(1, 10);
			$rate = $rate_avg + rand(-10, 10);
			$end_t = $now_t + rand(1, 365) * 86400;
			$speed = rand(0, 10);
			$location = $countries[rand(0, count($countries) - 1)];

			$offers[] = array(
				'size' => $size,
				'min_size' => $min_size,
				'rate' => $rate,
				'end_t' => $end_t,
				'speed' => $speed,
				'location' => $location,
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
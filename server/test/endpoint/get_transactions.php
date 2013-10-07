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
		$sampling_nbr = 200;
		$window_time = 86400 * 2;
		$event_delay = rand(0, 3600 * 6);
		$floating_avg = rand(51, 59);

		$end_t = time();
		$start_t = $end_t - $window_time;

		$output['result'] = array();
		$t = $start_t;
		$event_t = $start_t;
		while ($t < $end_t) {
			$t += rand(0, $window_time * 2 / $sampling_nbr);
			if ($t - $event_t > $event_delay) {
				$event_t = $t;
				$floating_avg += rand(-3, 3);
				$event_delay = rand(0, 3600 * 6);
			}

			$transaction = array(
				'timestamp' => $t,
				'rate' => $floating_avg - 1 + rand(0, 1000) / 500,
			);
			$output['result'][] = $transaction;
		}
	} catch (Exception $e) {
		$output['error'] = $e->getMessage();
	}
	debug_r('OUTPUT', $output);
	$result = prettyPrint(json_encode($output));
	echo $result;
?>
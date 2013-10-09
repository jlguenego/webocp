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
		$now_t = time();

		$sampling_density = 100 ; // sample nbr per day
		$window_time = 86400 * 2;
		$sampling_nbr = $sampling_density * ($window_time / 86400);
		$event_delay = rand(0, 3600 * 6);
		$floating_avg = rand(51, 59);
		$start_t = $now_t - $window_time;
		$end_t = $now_t;


		if (isset($_REQUEST['start_t'])) {
			$start_t = $_REQUEST['start_t'];
		}
		if (isset($_REQUEST['end_t'])) {
			$end_t = $_REQUEST['end_t'];
		}

		$transaction_list = array();
		$t = $start_t;
		$event_t = $start_t;
		$t += rand(0, $window_time * 2 / $sampling_nbr);
		while ($t < $end_t) {
			if ($t - $event_t > $event_delay) {
				$event_t = $t;
				$floating_avg += rand(-3, 3);
				$event_delay = rand(0, 3600 * 6);
			}

			$transaction = array(
				'timestamp' => $t,
				'rate' => $floating_avg - 1 + rand(0, 1000) / 500,
				'quantity' => (rand(0, 10) / 2) + 0.5,
			);
			$transaction_list[] = $transaction;
			$t += rand(0, $window_time * 2 / $sampling_nbr);
		}
		$output['result'] = array(
			'transaction_list' => $transaction_list,
			'query' => array(
				'start_t' => $start_t,
				'end_t' => $end_t,
			),
		);
	} catch (Exception $e) {
		$output['error'] = $e->getMessage();
	}
	debug_r('OUTPUT', $output);
	$result = prettyPrint(json_encode($output));
	echo $result;
?>
<?php
	error_reporting(E_ERROR|E_WARNING|E_PARSE);
	header('Access-Control-Allow-Origin: *');
	header("Content-Type:text/plain; charset=UTF-8;");
	define("BASE_DIR", dirname(dirname(dirname(__FILE__))));

	require_once(BASE_DIR . '/include/misc.inc');
	require_once(BASE_DIR . '/include/constant.inc');
	require_once(BASE_DIR . '/include/format.inc');

	$_REQUEST = array_merge($_GET, $_POST);
	debug_r('$_REQUEST=', $_REQUEST);
	$output = array();
	try {
		$time = $_REQUEST['time'];
		if (!isset($_REQUEST['time'])) {
			$time = 1000;
		}
		usleep($time * 1000);
	} catch (Exception $e) {
		$output['error'] = $e->getMessage();
	}
	$result = json_encode($output);
	debug('$result=' . $result);
	echo $result;
?>
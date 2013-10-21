<?php
	define("SCRIPT_FILE", __FILE__);
	require_once(dirname(dirname(dirname(SCRIPT_FILE))) . '/include/header.inc');

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
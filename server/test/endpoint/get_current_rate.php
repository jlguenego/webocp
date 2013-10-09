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
		$output['result'] = array(
			'rate' =>rand(51, 59),
			'timestamp' => time(),
		);
	} catch (Exception $e) {
		$output['error'] = $e->getMessage();
	}
	debug_r('OUTPUT', $output);
	$result = prettyPrint(json_encode($output));
	echo $result;
?>
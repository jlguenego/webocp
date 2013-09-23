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
		$contact_list = OCP::get_contact_list();
		print_r($contact_list);
		$output['result']['contact_list'] = $contact_list;
	} catch (Exception $e) {
		$output['error'] = $e->getMessage();
	}
	debug_r('OUTPUT', $output);
	$result = json_encode($output);
	echo $result;
?>
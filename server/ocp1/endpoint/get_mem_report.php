<?php
	define("SCRIPT_FILE", __FILE__);
	require_once(dirname(dirname(dirname(SCRIPT_FILE))) . '/include/header.inc');

	$_REQUEST = array_merge($_GET, $_POST);
	$output = array();
	try {
		$ocp = new OCP();
		$ocp->load(OCP::get_name_from_url($_SERVER['REQUEST_URI']));
		$output['result'] = $ocp->get_mem_report();
	} catch (Exception $e) {
		$output['error'] = $e->getMessage();
	}
	$result = prettyPrint(json_encode($output));
	debug($result);
	echo $result;
?>
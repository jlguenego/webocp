<?php
	define("SCRIPT_FILE", __FILE__);
	require_once(dirname(dirname(dirname(SCRIPT_FILE))) . '/include/header.inc');

	$_REQUEST = array_merge($_GET, $_POST);
	$output = array();
	try {
		$new_contact = json_decode($_REQUEST['contact']);
		$ocp = new OCP();
		$ocp->load(OCP::get_name_from_url($_SERVER['REQUEST_URI']));
		$name = $ocp->name;
		$ocp->contact_list->$name = $ocp->to_contact();
		$output['result'] = $ocp->contact_list;
	} catch (Exception $e) {
		$output['error'] = $e->getMessage();
	}
	debug_r('OUTPUT', $output);
	$result = prettyPrint(json_encode($output));
	echo $result;
?>
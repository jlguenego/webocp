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
		if (!isset($_REQUEST['contact'])) {
			throw new Exception('No contact given');
		}
		$new_contact = json_decode($_REQUEST['contact']);
		$ocp = new OCP();
		$ocp->load(OCP::get_name_from_url($_SERVER['REQUEST_URI']));

		$name = $new_contact->name;
		if ($ocp->contact_list == null) {
			$ocp->contact_list = array();
			$ocp->contact_list[$name] = $new_contact;
		} else {
			$ocp->contact_list->$name = $new_contact;
		}
		$ocp->store();

		$output['result']['contact_list'] = array();
		foreach ($ocp->contact_list as $name => $contact) {
		 	 if ($name != $new_contact->name) {
		 	 	$output['result']['contact_list'][$name] = $contact;
		 	}
		}
		$output['result']['contact_list'][$ocp->name] = $ocp->to_contact();
	} catch (Exception $e) {
		$output['error'] = $e->getMessage();
	}
	debug_r('OUTPUT', $output);
	$result = json_encode($output);
	echo $result;
?>
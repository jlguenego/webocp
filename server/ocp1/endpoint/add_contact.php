<?php
	define("SCRIPT_FILE", __FILE__);
	require_once(dirname(dirname(dirname(SCRIPT_FILE))) . '/include/header.inc');

	$_REQUEST = array_merge($_GET, $_POST);
	$output = array();
	try {
		if (!isset($_REQUEST['contact'])) {
			throw new Exception('No contact given');
		}
		debug_r('_REQUEST[contact]', $_REQUEST['contact']);
		$new_contact = json_decode(base64_decode($_REQUEST['contact']));
		debug_r('new_contact', $new_contact);
		$ocp = new OCP();
		$ocp->load(OCP::get_name_from_url($_SERVER['REQUEST_URI']));
		$name = $new_contact->name;
		$ocp->contact_list->$name = $new_contact;
		$ocp->store();

		$output['result'] = 'OK';
	} catch (Exception $e) {
		$output['error'] = $e->getMessage();
	}
	debug_r('OUTPUT', $output);
	$result = json_encode($output);
	echo $result;
?>
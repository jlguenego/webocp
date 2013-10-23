<?php
	define("SCRIPT_FILE", __FILE__);
	require_once(dirname(dirname(dirname(SCRIPT_FILE))) . '/include/header.inc');

	$_REQUEST = array_merge($_GET, $_POST);
	$output = array();
	try {
		if (!isset($_REQUEST['contact'])) {
			throw new Exception('No contact given');
		}
		$new_contact = json_decode(base64_decode($_REQUEST['contact']));
		debug('new_contact=' . base64_decode($_REQUEST['contact']));
		debug_r('new_contact', $new_contact);
		$ocp = new OCP();
		$ocp->load(OCP::get_name_from_url($_SERVER['REQUEST_URI']));

		$name = $new_contact->name;
		debug_r('ocp', $ocp);
		if ($ocp->contact_list == null) {
			$ocp->contact_list = array();
			$ocp->contact_list[$name] = $new_contact;
		} else {
			$ocp->contact_list->$name = $new_contact;
		}
		$ocp->store();
		$ocp->inform_all($new_contact);

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
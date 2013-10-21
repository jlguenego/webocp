<?php
	define("SCRIPT_FILE", __FILE__);
	require_once(dirname(dirname(dirname(SCRIPT_FILE))) . '/include/header.inc');

	$name = OCP::get_name_from_url($_SERVER['REQUEST_URI']);
	storage_set_root(ROOT . '/test/' . $name);

	$_REQUEST = array_merge($_GET, $_POST);
	debug_r('_REQUEST', $_REQUEST);
	$output = array();
	try {
		$file = storage_retrieve_path($_REQUEST['filename']);
		debug('path='.$file);
		if (!file_exists($file)) {
			throw new Exception('This file does not exists.');
		}
		$output['result']['content'] = base64_encode(file_get_contents($file));
	} catch (Exception $e) {
		$output['error'] = $e->getMessage();
	}
	$result = json_encode($output);
	echo $result;
?>
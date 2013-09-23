<?php
	error_reporting(E_ERROR|E_WARNING|E_PARSE);
	header('Access-Control-Allow-Origin: *');
	header("Content-Type:text/plain; charset=UTF-8;");
	define("BASE_DIR", dirname(dirname(dirname(__FILE__))));

	require_once(BASE_DIR . '/include/misc.inc');
	require_once(BASE_DIR . '/include/constant.inc');
	require_once(BASE_DIR . '/include/format.inc');
	require_once(BASE_DIR . '/include/storage.inc');

	$g_debug = true;
	storage_set_root(ROOT . '/test');

	$_REQUEST = array_merge($_GET, $_POST);
	$output = array();
	try {
		$file = storage_retrieve_path($_REQUEST['filename']);
		debug('path='.$file);
		if (!file_exists($file)) {
			throw new Exception('This file does not exists.');
		}
		$output['result']['content'] = base64_encode(file_get_contents($file));
		debug("File content:\n" . $output['result']['content']);
	} catch (Exception $e) {
		$output['error'] = $e->getMessage();
	}
	$result = json_encode($output);
	debug('$result=' . $result);
	echo $result;
?>
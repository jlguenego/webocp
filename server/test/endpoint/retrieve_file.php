<?php
	error_reporting(E_ERROR|E_WARNING|E_PARSE);
	header('Access-Control-Allow-Origin: *');
	header("Content-Type:text/plain; charset=UTF-8;");
	define("BASE_DIR", dirname(dirname(dirname(__FILE__))));

	require_once(BASE_DIR . '/include/misc.inc');
	require_once(BASE_DIR . '/include/constant.inc');
	require_once(BASE_DIR . '/include/global.inc');
	require_once(BASE_DIR . '/include/format.inc');
	require_once(BASE_DIR . '/include/storage.inc');
	require_once(BASE_DIR . '/include/ocp.inc');

	$g_debug = true;
	$name = OCP::get_name_from_url($_SERVER['REQUEST_URI']);
	storage_set_root(ROOT . '/test/' . $name);

	$_REQUEST = array_merge($_GET, $_POST);
	debug_r('_REQUEST', $_REQUEST);
	$output = array();
	try {
		if (!isset($_REQUEST['public_key'])) {
			throw new Exception('No identification given.');
		}
		$file = storage_retrieve_path($_REQUEST['filename']);
		debug('path='.$file);
		if (!file_exists($file)) {
			throw new Exception('This file does not exists.');
		}
		$content = file_get_contents($file);
		$length = intval(substr($content , 0, 4));
		$json = json_decode(substr($content , 4, $length));

		debug_r('json', $json);

		if ($json->public_key != $_REQUEST['public_key']) {
			throw new Exception('You do not own this file.');
		}

		$output['result']['content'] = base64_encode($content);
	} catch (Exception $e) {
		$output['error'] = $e->getMessage();
	}
	$result = json_encode($output);
	echo $result;
?>
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
	$output = array();
	try {
		$file = storage_retrieve_path($_REQUEST['filename']);
		debug('path='.$file);
		if (file_exists($file)) {
			unlink($file);
		}
	} catch (Exception $e) {
		$output['error'] = $e->getMessage();
	}
	$result = json_encode($output);
	echo $result;
?>
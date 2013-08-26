<?php
	error_reporting(E_ERROR|E_WARNING|E_PARSE);
	header('Access-Control-Allow-Origin: *');
	header("Content-Type:text/plain; charset=UTF-8;");
	define("BASE_DIR", dirname(dirname(dirname(__FILE__))));

	require_once(BASE_DIR . '/include/misc.inc');
	require_once(BASE_DIR . '/include/constant.inc');
	require_once(BASE_DIR . '/include/format.inc');

	$_REQUEST = array_merge($_GET, $_POST);
	$output = array();
	try {
		$file = ROOT . '/test/' . $_REQUEST['filename'];
		debug('path='.$file);
		if (file_exists($file)) {
			throw new Exception('This file already exists.');
		}
		file_put_contents($file, $_REQUEST['content']);
		$output['result'] = 'OK';
	} catch (Exception $e) {
		$output['error'] = $e->getMessage();
	}
	$result = json_encode($output);
	echo $result;
?>
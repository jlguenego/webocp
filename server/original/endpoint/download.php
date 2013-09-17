<?php
	define("BASE_DIR", dirname(dirname(dirname(__FILE__))));

	require_once(BASE_DIR . '/include/global.inc');
	require_once(BASE_DIR . '/include/misc.inc');
	require_once(BASE_DIR . '/include/constant.inc');

	try {
		if (!isset($_GET['path'])) {
			throw new Exception('path not found.');
		}
		$path = $_GET['path'];
		debug('path=' . $path);
		$name = basename($path);
		$filename = ROOT . $path;
		if (!is_file($filename)) {
			throw new Exception('file does not exist.');
		}
		$fp = fopen($filename, 'rb');
		header('Access-Control-Allow-Origin: *');
		header('Content-Disposition: attachment; filename="'.$name.'"');
		header("Content-Transfer-Encoding: binary");
		header('Accept-Ranges: bytes');
		header("Cache-control: private");
		header('Pragma: private');
		header('Content-Length: ' . filesize($filename));
		fpassthru($fp);
		exit;
	} catch (Exception $e) {
		$output = array();
		$output['error'] = $e->getMessage();
		$result = json_encode($output);
		echo $result;
	}
?>
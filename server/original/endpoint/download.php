<?php
	define("BASE_DIR", dirname(dirname(dirname(__FILE__))));

	require_once(BASE_DIR . '/include/global.inc');
	require_once(BASE_DIR . '/include/misc.inc');
	require_once(BASE_DIR . '/include/constant.inc');

	$path = $_GET['path'];
	debug('path=' . $path);
	$name = basename($path);
	$filename = ROOT . $path;
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
?>
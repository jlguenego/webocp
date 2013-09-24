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
		$name = OCP::get_name_from_url($_SERVER['REQUEST_URI']);
		$url = 'http://' . $_SERVER['HTTP_HOST'] . preg_replace('#(.*' . $name . ')/endpoint.*#', "$1", $_SERVER['REQUEST_URI']);
		file_get_contents(
			$url . '/endpoint/start.php?' .
			'name=' . $name .
			'&url=' . $url
		);
		for ($i = 1; $i < 10; $i++) {
			$name = 'node' . $i;
			$node_url = dirname($url) . '/' . $name;
			file_get_contents(
				$node_url . '/endpoint/start.php?' .
				'name=' . $name .
				'&url=' . $node_url .
				'&sponsor=' . $url
			);
		}
	} catch (Exception $e) {
		$output['error'] = $e->getMessage();
	}
	debug_r('OUTPUT', $output);
	$result = prettyPrint(json_encode($output));
	echo $result;
?>
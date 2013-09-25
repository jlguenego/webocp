<?php
	error_reporting(E_ERROR|E_WARNING|E_PARSE);
	header('Access-Control-Allow-Origin: *');
	header("Content-Type:text/plain; charset=UTF-8;");
	define("BASE_DIR", dirname(dirname(dirname(__FILE__))));

	require_once(BASE_DIR . '/include/constant.inc');
	require_once(BASE_DIR . '/include/global.inc');
	require_once(BASE_DIR . '/include/misc.inc');
	require_once(BASE_DIR . '/include/format.inc');
	require_once(BASE_DIR . '/include/storage.inc');
	require_once(BASE_DIR . '/include/ocp.inc');

	$name = OCP::get_name_from_url($_SERVER['REQUEST_URI']);
	storage_set_root(ROOT . '/test/' . $name);

	$_REQUEST = array_merge($_GET, $_POST);

	//sleep(10);
	$bad_mood = rand(0, 10) < 0;

	if ($bad_mood) {
		http_response_code(404);
		exit;
	}

	$g_debug = true;
	debug('start');
	debug('URI=' . $_SERVER['REQUEST_URI']);
	debug_r('_FILES', $_FILES);
	debug_r('_REQUEST', $_REQUEST);
	$output = array();
	$output['_REQUEST'] = $_REQUEST;
	$output['_FILES'] = $_FILES;
	try {
		$root_dir = storage_get_root();
		mkdir_p($root_dir);

		$file = storage_generate_path($_REQUEST['filename']);
		debug('path='.$file);
		mkdir_p(dirname($file));
		$tmp_file = $_FILES['content']['tmp_name'];

		rename($tmp_file, $file);
		$output['result'] = 'OK';
	} catch (Exception $e) {
		$output['error'] = $e->getMessage();
	}
	debug_r('output', $output);
	$result = json_encode($output);
	echo $result;
?>
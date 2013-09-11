<?php
	error_reporting(E_ERROR|E_WARNING|E_PARSE);
	header('Access-Control-Allow-Origin: *');
	header("Content-Type:text/plain; charset=UTF-8;");
	define("BASE_DIR", dirname(dirname(dirname(__FILE__))));

	require_once(BASE_DIR . '/include/global.inc');
	require_once(BASE_DIR . '/include/misc.inc');
	require_once(BASE_DIR . '/include/constant.inc');
	require_once(BASE_DIR . '/include/format.inc');
	define("TEST_DIR", ROOT . '/test/');

	$_REQUEST = array_merge($_GET, $_POST);

	$bad_mood = rand(0, 10) < 0;

	if ($bad_mood) {
		http_response_code(404);
		exit;
	}

	debug_r('_FILES', $_FILES);
	debug_r('_REQUEST', $_REQUEST);
	$output = array();
	$output['_REQUEST'] = $_REQUEST;
	$output['_FILES'] = $_FILES;
	try {
		if (!is_dir(TEST_DIR)) {
			if (!@mkdir(TEST_DIR)) {
				throw new Exception('Cannot create the test folder.');
			}
		}
		$file = TEST_DIR . $_REQUEST['filename'];
		debug('path='.$file);
		if (file_exists($file)) {
			throw new Exception('This file already exists.');
		}
		$tmp_file = $_FILES['content']['tmp_name'];

		rename($tmp_file, $file);
		$output['result'] = 'OK';
	} catch (Exception $e) {
		$output['error'] = $e->getMessage();
	}
	$result = json_encode($output);
	echo $result;
?>
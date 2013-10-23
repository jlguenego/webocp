<?php
	error_reporting(E_ERROR|E_WARNING|E_PARSE);
	header('Access-Control-Allow-Origin: *');
	header("Content-Type:text/plain; charset=UTF-8;");
	header('Cache-Control: no-cache, must-revalidate');

	define("INCLUDE_DIR", dirname(__FILE__));
	define("BASE_DIR", dirname(INCLUDE_DIR));
	define('SCRIPT_NAME', basename(SCRIPT_FILE, '.php'));

	require_once(INCLUDE_DIR . '/constant.inc');
	require_once(INCLUDE_DIR . '/global.inc');
	require_once(INCLUDE_DIR . '/misc.inc');
	require_once(INCLUDE_DIR . '/format.inc');
	require_once(INCLUDE_DIR . '/storage.inc');
	require_once(INCLUDE_DIR . '/ocp.inc');

	$g_debug = true;

	$name = OCP::get_name_from_url($_SERVER['REQUEST_URI']);
	storage_set_root(ROOT . '/ocp1/' . $name);

	debug('SCRIPT_NAME=' . SCRIPT_NAME);
?>
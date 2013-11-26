<?php
	error_reporting(E_ERROR|E_WARNING|E_PARSE);
	header('Access-Control-Allow-Origin: *');
	header("Content-Type:text/plain; charset=UTF-8;");
	header('Cache-Control: no-cache, must-revalidate');

	define("INCLUDE_DIR", dirname(__FILE__));
	define("BASE_DIR", dirname(INCLUDE_DIR));
	define("WEB_DIR", dirname(dirname(dirname($_SERVER['SCRIPT_NAME'])))); // Server dir
	define('SCRIPT_NAME', basename(SCRIPT_FILE, '.php'));

	require_once(INCLUDE_DIR . '/constant.inc');
	require_once(INCLUDE_DIR . '/global.inc');
	require_once(INCLUDE_DIR . '/misc.inc');
	require_once(INCLUDE_DIR . '/format.inc');
	require_once(INCLUDE_DIR . '/storage.inc');
	require_once(INCLUDE_DIR . '/ocp.inc');

	require_once(INCLUDE_DIR . '/class/Upnp.class.php');
	require_once(INCLUDE_DIR . '/class/Cache.class.php');

	require_once(INCLUDE_DIR . '/network.inc');
	require_once(INCLUDE_DIR . '/ipv6.inc');
	require_once(INCLUDE_DIR . '/port_mapping.inc');

	$g_debug = true;

	debug('url=' . $_SERVER['REQUEST_URI']);

	$name = OCP::get_name_from_url($_SERVER['REQUEST_URI']);
	storage_set_root(ROOT . '/ocp1/' . $name);

	debug('SCRIPT_NAME=' . SCRIPT_NAME);
?>
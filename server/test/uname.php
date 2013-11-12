<?php
	define("SCRIPT_FILE", __FILE__);
	require_once(dirname(dirname(SCRIPT_FILE)) . '/include/header.inc');
	require_once(INCLUDE_DIR . '/class/Upnp.class.php');
	require_once(INCLUDE_DIR . '/network.inc');

	echo php_uname('n');
?>
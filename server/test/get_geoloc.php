<?php
	define("SCRIPT_FILE", __FILE__);
	require_once(dirname(dirname(SCRIPT_FILE)) . '/include/header.inc');

	$ip = get_public_ip();
	echo get_geoloc($ip);
?>
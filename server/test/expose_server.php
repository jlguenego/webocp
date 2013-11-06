<?php
	define("SCRIPT_FILE", __FILE__);
	require_once(dirname(dirname(SCRIPT_FILE)) . '/include/header.inc');

	$server_address_spec = upnp_expose_server();
	ptint_r($server_address_spec);
?>
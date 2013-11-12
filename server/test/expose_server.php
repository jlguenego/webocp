<?php
	define("SCRIPT_FILE", __FILE__);
	require_once(dirname(dirname(SCRIPT_FILE)) . '/include/header.inc');

	$server_address_spec = network_add_nat_traversal();
	print_r($server_address_spec);
?>
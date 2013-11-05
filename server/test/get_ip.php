<?php
	define("SCRIPT_FILE", __FILE__);
	require_once(dirname(dirname(SCRIPT_FILE)) . '/include/header.inc');
	require_once(INCLUDE_DIR . '/class/Upnp.class.php');

	$upnp = new Upnp();

	$service_type = 'urn:schemas-upnp-org:service:WANPPPConnection:1';

	//echo "Discovering network...\n";
	$upnp->discover();
	if (!$upnp->hasService($service_type)) {
		echo 'SSDP WANPPPConnection service not found.';
		return;
	}

	$service = $upnp->getService($service_type);

	$action = 'GetExternalIPAddress';
	$args = array();

	//echo "Sending request: $action\n";
	$output = $service->sendRequest($action, $args);

	$dom = new DOMDocument();
	$dom->loadXML($output);
	echo $dom->textContent;
?>
<?php
	define("SCRIPT_FILE", __FILE__);
	require_once(dirname(dirname(SCRIPT_FILE)) . '/include/header.inc');
	require_once(INCLUDE_DIR . '/class/Upnp.class.php');

	$upnp = new Upnp();

	$service_type = 'urn:schemas-upnp-org:service:WANIPConnection:1';

	$cache = new Cache();
	$service_str = $cache->get($service_type);

	if ($service_str == null) {
		$upnp->discover();
		if (!$upnp->hasService($service_type)) {
			echo 'SSDP WANPPPConnection service not found.';
			return;
		}

		$service = $upnp->getService($service_type);
		$str = base64_encode(serialize($service));
		debug($str);
		$cache->set($service_type, $str);
	} else {
		$service = unserialize(base64_decode($service_str));
	}
	debug_r('service=', $service);

	$action = 'QueryStateVariable';
	$args = array('u:varName' => 'PortMappingNumberOfEntries');
	$output = $service->sendRequest($action, $args);
	$dom = DOMDocument::loadXML($output);
	$port_mapping_nbr = $dom->documentElement->nodeValue;

	//echo preg_replace('#><#', ">\n<", $output) . "\n";

	$mappings = array();
	for ($i = 0; $i < $port_mapping_nbr; $i++) {
		$action = 'GetGenericPortMappingEntry';
		$args = array( 'NewPortMappingIndex' => $i);

		$output = $service->sendRequest($action, $args);
		//echo preg_replace('#><#', ">\n<", $output) . "\n";

		$dom = DOMDocument::loadXML($output);
		$mappings[] = array(
			'remote_host' => $dom->documentElement->getElementsByTagName('NewRemoteHost')->item(0)->nodeValue,
			'external_port' => $dom->documentElement->getElementsByTagName('NewExternalPort')->item(0)->nodeValue,
			'protocol' => $dom->documentElement->getElementsByTagName('NewProtocol')->item(0)->nodeValue,
			'internal_port' => $dom->documentElement->getElementsByTagName('NewInternalPort')->item(0)->nodeValue,
			'internal_client' => $dom->documentElement->getElementsByTagName('NewInternalClient')->item(0)->nodeValue,
			'enabled' => $dom->documentElement->getElementsByTagName('NewEnabled')->item(0)->nodeValue,
			'descr' => $dom->documentElement->getElementsByTagName('NewPortMappingDescription')->item(0)->nodeValue,
			'duration' => $dom->documentElement->getElementsByTagName('NewLeaseDuration')->item(0)->nodeValue,
		);
	}

	header("Content-Type:text/html; charset=UTF-8;");
?>

<!DOCTYPE html>
<html>
	<head>
	</head>

	<body>
		<table>
			<tr>
				<th>Protocol</th>
				<th>Remote host</th>
				<th>External port</th>
				<th>Destination IP</th>
				<th>Destination port</th>
				<th>Description</th>
				<th>Duration</th>
				<th>Enabled</th>
			</tr>
<?php
	foreach ($mappings as $mapping) {
		$tr = <<<EOF
			<tr>
				<td>{$mapping['protocol']}</td>
				<td>{$mapping['remote_host']}</td>
				<td>{$mapping['external_port']}</td>
				<td>{$mapping['internal_client']}</td>
				<td>{$mapping['internal_port']}</td>
				<td>{$mapping['descr']}</td>
				<td>{$mapping['duration']}</td>
				<td>{$mapping['enabled']}</td>
			</tr>

EOF;
		echo $tr;
	}
?>
		</table>
	</body>
</html>
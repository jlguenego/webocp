<?php
	function list_port_forwarding() {
		$upnp = new Upnp();

		$service_type = 'urn:schemas-upnp-org:service:WANIPConnection:1';
		$service = $upnp->getService($service_type);

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
		$result = <<<EOF
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
		<th>Delete</th>
	</tr>

EOF;
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
		<td>
			<form method="GET" action="">
				<input type="hidden" name="remote_host" value="{$mapping['remote_host']}" />
				<input type="hidden" name="external_port" value="{$mapping['external_port']}" />
				<input type="hidden" name="protocol" value="{$mapping['protocol']}" />
				<input type="hidden" name="delete" value="1" />
				<input type="submit" value="Delete" />
			</form>
		</td>
	</tr>

EOF;
			$result .= $tr;
		}
		$result .= <<<EOF
</table>
EOF;
		return $result;
	}

	function remove_ocp_port_forwarding() {
		$upnp = new Upnp();

		$service_type = 'urn:schemas-upnp-org:service:WANIPConnection:1';
		$service = $upnp->getService($service_type);

		$action = 'QueryStateVariable';
		$args = array('u:varName' => 'PortMappingNumberOfEntries');
		$output = $service->sendRequest($action, $args);
		$dom = DOMDocument::loadXML($output);
		$port_mapping_nbr = $dom->documentElement->nodeValue;

		for ($i = 0; $i < $port_mapping_nbr; $i++) {
			$action = 'GetGenericPortMappingEntry';
			$args = array( 'NewPortMappingIndex' => $i);

			$output = $service->sendRequest($action, $args);

			$dom = DOMDocument::loadXML($output);
			$descr = $dom->documentElement->getElementsByTagName('NewPortMappingDescription')->item(0)->nodeValue;
			if ($descr == OCP_PORT_MAPPING_DESCR) {
				$action = 'DeletePortMapping';
				$args = array(
					'NewRemoteHost' => $dom->documentElement->getElementsByTagName('NewRemoteHost')->item(0)->nodeValue,
					'NewExternalPort' =>  $dom->documentElement->getElementsByTagName('NewExternalPort')->item(0)->nodeValue,
					'NewProtocol' =>  $dom->documentElement->getElementsByTagName('NewProtocol')->item(0)->nodeValue,
				);
				$service->sendRequest($action, $args);
			}
		}
	}
?>
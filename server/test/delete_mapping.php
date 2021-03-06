<?php
	define("SCRIPT_FILE", __FILE__);
	require_once(dirname(dirname(SCRIPT_FILE)) . '/include/header.inc');
	require_once(INCLUDE_DIR . '/class/Upnp.class.php');

	if (isset($_GET['mapping'])) {
		$upnp = new Upnp();

		$service_type = 'urn:schemas-upnp-org:service:WANPPPConnection:1';

		$upnp->discover();
		if (!$upnp->hasService($service_type)) {
			echo 'SSDP WANPPPConnection service not found.';
			return;
		}

		$service = $upnp->getService($service_type);

		$action = 'DeletePortMapping';
		$args = array(
			'NewRemoteHost' => '',
			'NewExternalPort' =>  $_GET['external_port'],
			'NewProtocol' =>  $_GET['protocol'],
		);

		echo "Sending request: $action\n";
		$output = $service->sendRequest($action, $args);

		$dom = new DOMDocument();
		$dom->loadXML($output);
		echo $dom->textContent;
		exit;
	}
	header("Content-Type:text/html; charset=UTF-8;");
?>

<!DOCTYPE html>
<html>
	<head>
	</head>

	<body>
		<form method="GET" action="">
			External port: <input type="number" name="external_port" value="80"/><br />
			Protocol : <select name="protocol">
				<option value="TCP">TCP</option>
				<option value="UDP">UDP</option>
			</select><br />
			<input type="hidden" name="mapping" value="1"/>
			<input type="submit" value="Submit" />
		</form>
	</body>
</html>
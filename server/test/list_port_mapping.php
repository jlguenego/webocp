<?php
	define("SCRIPT_FILE", __FILE__);
	require_once(dirname(dirname(SCRIPT_FILE)) . '/include/header.inc');

	if (isset($_GET['delete'])) {
		$upnp = new Upnp();

		$service_type = 'urn:schemas-upnp-org:service:WANPPPConnection:1';

		$service = $upnp->getService($service_type);

		$action = 'DeletePortMapping';
		$args = array(
			'NewRemoteHost' => $_GET['remote_host'],
			'NewExternalPort' =>  $_GET['external_port'],
			'NewProtocol' =>  $_GET['protocol'],
		);

		$output = $service->sendRequest($action, $args);
	}

	header("Content-Type:text/html; charset=UTF-8;");
?>

<!DOCTYPE html>
<html>
	<head>
	</head>

	<body>
<?php echo list_port_forwarding(); ?>
	</body>
</html>
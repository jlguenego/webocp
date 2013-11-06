<?php
	define("SCRIPT_FILE", __FILE__);
	require_once(dirname(dirname(SCRIPT_FILE)) . '/include/header.inc');
	require_once(INCLUDE_DIR . '/class/Upnp.class.php');

	remove_ocp_port_forwarding();

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
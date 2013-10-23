<?php
	define("SCRIPT_FILE", __FILE__);
	require_once(dirname(dirname(dirname(SCRIPT_FILE))) . '/include/header.inc');

	$_REQUEST = array_merge($_GET, $_POST);
	header("Content-Type:text/html; charset=UTF-8;");

	$ocp = new OCP();
	$ocp->load(OCP::get_name_from_url($_SERVER['REQUEST_URI']));
?>

<!DOCTYPE html>
<html>
	<head>
	</head>

	<body>
		Hello <?php echo $ocp->name; ?>!!!
	</body>
</html>
<?php
	define("SCRIPT_FILE", __FILE__);
	require_once(dirname(dirname(dirname(SCRIPT_FILE))) . '/include/header.inc');

	$_REQUEST = array_merge($_GET, $_POST);
	header("Content-Type:text/html; charset=UTF-8;");

	$ocp = new OCP();
	$ocp->load(OCP::get_name_from_url($_SERVER['REQUEST_URI']));
	$memory_report = $ocp->get_mem_report();
?>

<!DOCTYPE html>
<html>
	<head>
	</head>

	<body>
		<ul>
			<li>Node name: <b><?php echo $ocp->name; ?></b></li>
			<li>Access to the <a href="<?php echo $ocp->get_dir(); ?>" target="_blank">Raw Datas</a></li>
			<li>Memory report</li>
			<ul>
				<li>Used space: <?php echo format_size($memory_report['used']); ?></li>
				<li>Free space: <?php echo format_size($memory_report['total'] - $memory_report['used']); ?></li>
				<li>Total: <?php echo format_size($memory_report['total']); ?></li>
			</ul>
		</ul>


		<div id="graph">
			<svg width="860" height="300"></svg>
		</div>

		<script>

		</script>
	</body>
</html>
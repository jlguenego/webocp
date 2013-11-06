<?php
	define("SCRIPT_FILE", __FILE__);
	require_once(dirname(dirname(SCRIPT_FILE)) . '/include/header.inc');

	$ip = '::1';
	if (isset($_GET['ip'])) {
		$ip = $_GET['ip'];
	}
	$result = ipv6_to_canonical($ip);
	header("Content-Type:text/html; charset=UTF-8;");
?>

<!DOCTYPE html>
<html>
	<head>
	</head>

	<body>
		<?php
			echo $ip . ' => ' . $result . '</br></br>';
			echo $ip . ' = ' . ipv6_to_bin($result) . '</br></br>';
		?>
		<form method="GET" action="">
			IP: <input type="text" name="ip" value="<?php echo $ip; ?>"/>
			<input type="submit" value="Submit" />
		</form>
	</body>
</html>
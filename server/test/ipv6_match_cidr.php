<?php
	define("SCRIPT_FILE", __FILE__);
	require_once(dirname(dirname(SCRIPT_FILE)) . '/include/header.inc');

	$ip = '::1';
	if (isset($_GET['ip'])) {
		$ip = $_GET['ip'];
	}
	$range = '::1/128';
	if (isset($_GET['range'])) {
		$range = $_GET['range'];
	}
	$result = ipv6_cidr_match($ip, $range);
	header("Content-Type:text/html; charset=UTF-8;");
?>

<!DOCTYPE html>
<html>
	<head>
	</head>

	<body>
		<pre>
<?php
	echo $ip . (($result)? ' matches ' : ' does not match ') . $range . '</br>';

	$mask_ip = explode('/', $range)[0];
	echo $mask_ip  . '</br>';
	echo ipv6_to_bin($mask_ip) . '</br>';
	echo ipv6_to_bin($ip) . '</br></br>';
?>
		</pre>
		<form method="GET" action="">
			Range: <input type="text" name="range" value="<?php echo $range; ?>"/>
			IP: <input type="text" name="ip" value="<?php echo $ip; ?>"/>
			<input type="submit" value="Submit" />
		</form>
	</body>
</html>
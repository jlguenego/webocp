<?php
	define("SCRIPT_FILE", __FILE__);
	require_once(dirname(dirname(dirname(SCRIPT_FILE))) . '/include/header.inc');

	$_REQUEST = array_merge($_GET, $_POST);
	debug('SCRIPT_NAME2=' . SCRIPT_NAME);
	if (isset($_REQUEST['node_qty']) && isset($_REQUEST['public_port'])) {
		$output = array();
		try {
			$node_qty = intval($_REQUEST['node_qty']);
			$name = OCP::get_name_from_url($_SERVER['REQUEST_URI']);

			$path = preg_replace('#(.*)/' . $name . '/endpoint.*#', "$1", $_SERVER['REQUEST_URI']);
			$public_ip = get_public_ip();


			for ($i = 0; $i < $node_qty; $i++) {
				$name = 'node' . $i;
				$quota = 1;
				$url = 'http://' . $public_ip . ':' . $_REQUEST['public_port'] . $path . '/' . $name;
				$b_lan = is_private_ip(gethostbyname($_SERVER['SERVER_NAME']));
				$lan_url = 'http://' . $_SERVER['HTTP_HOST'] . $path . '/' . $name;
				$node_url = $url;
				if ($b_lan) {
					$node_url = $lan_url;
				}

				if ($i == 0) {
					$sponsor_url = $node_url;
					file_get_contents(
						$node_url . '/endpoint/start.php?' .
						'name=' . $name .
						'&url=' . $url .
						'&quota=' . $quota .
						'&b_lan=' . $b_lan .
						'&lan_url=' . $lan_url
					);
					continue;
				}

				file_get_contents(
					$node_url . '/endpoint/start.php?' .
					'name=' . $name .
					'&url=' . $url .
					'&sponsor=' . $sponsor_url .
					'&quota=' . $quota .
					'&b_lan=' . $b_lan .
					'&lan_url=' . $lan_url
				);
			}
			$output['result'] = 'OK';
		} catch (Exception $e) {
			$output['error'] = $e->getMessage();
		}
		debug_r('OUTPUT', $output);
		$result = prettyPrint(json_encode($output));
		echo $result;
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
			Node quantity: <input type="number" name="node_qty" value="10"/><br />
			Public port: <input type="number" name="public_port" value="52123"/><br />
			<input type="submit" value="Submit" />
		</form>
	</body>
</html>
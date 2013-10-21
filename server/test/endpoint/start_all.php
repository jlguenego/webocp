<?php
	define("SCRIPT_FILE", __FILE__);
	require_once(dirname(dirname(dirname(SCRIPT_FILE))) . '/include/header.inc');

	$_REQUEST = array_merge($_GET, $_POST);
	debug('SCRIPT_NAME2=' . SCRIPT_NAME);
	if (isset($_REQUEST['node_qty'])) {
		$output = array();
		try {
			$node_qty = intval($_REQUEST['node_qty']);
			$name = OCP::get_name_from_url($_SERVER['REQUEST_URI']);
			$url = 'http://' . $_SERVER['HTTP_HOST'] . preg_replace('#(.*)/' . $name . '/endpoint.*#', "$1", $_SERVER['REQUEST_URI']);
			for ($i = 0; $i < $node_qty; $i++) {
				$name = 'node' . $i;
				$node_url = $url . '/' . $name;
				$quota = 1;
				if ($i == 0) {
					$sponsor_url = $node_url;
					file_get_contents(
						$node_url . '/endpoint/start.php?' .
						'name=' . $name .
						'&url=' . $node_url .
						'&quota=' . $quota
					);
					continue;
				}

				file_get_contents(
					$node_url . '/endpoint/start.php?' .
					'name=' . $name .
					'&url=' . $node_url .
					'&sponsor=' . $sponsor_url .
					'&quota=' . $quota
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
			<input type="submit" value="Submit" />
		</form>
	</body>
</html>
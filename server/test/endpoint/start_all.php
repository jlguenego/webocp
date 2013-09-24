<?php
	error_reporting(E_ERROR|E_WARNING|E_PARSE);
	header('Access-Control-Allow-Origin: *');
	header("Content-Type:text/plain; charset=UTF-8;");
	define("BASE_DIR", dirname(dirname(dirname(__FILE__))));

	require_once(BASE_DIR . '/include/misc.inc');
	require_once(BASE_DIR . '/include/constant.inc');
	require_once(BASE_DIR . '/include/format.inc');
	require_once(BASE_DIR . '/include/storage.inc');
	require_once(BASE_DIR . '/include/ocp.inc');

	$g_debug = true;

	$_REQUEST = array_merge($_GET, $_POST);
	if (isset($_REQUEST['node_qty'])) {
		$output = array();
		try {
			$name = OCP::get_name_from_url($_SERVER['REQUEST_URI']);
			$url = 'http://' . $_SERVER['HTTP_HOST'] . preg_replace('#(.*)/' . $name . '/endpoint.*#', "$1", $_SERVER['REQUEST_URI']);
			for ($i = 0; $i < 10; $i++) {
				$name = 'node' . $i;
				$node_url = $url . '/' . $name;
				if ($i == 0) {
					$sponsor_url = $node_url;
					file_get_contents(
						$node_url . '/endpoint/start.php?' .
						'name=' . $name .
						'&url=' . $node_url
					);
					continue;
				}

				file_get_contents(
					$node_url . '/endpoint/start.php?' .
					'name=' . $name .
					'&url=' . $node_url .
					'&sponsor=' . $sponsor_url
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
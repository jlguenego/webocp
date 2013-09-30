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
			$node_qty = intval($_REQUEST['node_qty']);
			$name = OCP::get_name_from_url($_SERVER['REQUEST_URI']);
			$start_addresses = array();

			for ($i = 0; $i < $node_qty; $i++) {
				$start_addresses[] = sha1('node' . $i);
			}

			for ($i = 0; $i < $node_qty; $i++) {
				$ocp = new OCP();
				$contact_list = array();

				for ($j = 0; $j < $node_qty; $j++) {
					if ($i == $j) {
						continue;
					}
					$contact_list['node' . $j] = array(
						'name' => 'node' . $j,
						'url' => 'http://' .
							$_SERVER['HTTP_HOST'] .
							preg_replace(
								'#(.*/)' . $name . '/endpoint.*#',
								"$1node" . $j,
								$_SERVER['REQUEST_URI']
							),
						'start_address' => $start_addresses[$j],
					);
				}

				$ocp->hydrate(array(
					'name' => 'node' . $i,
					'url' => 'http://' . $_SERVER['HTTP_HOST'] . preg_replace('#(.*/)' . $name . '/endpoint.*#', "$1node" . $i, $_SERVER['REQUEST_URI']),
					'contact_list' => $contact_list,
					'start_address' => $start_addresses[$i],
				));

				$ocp->store();
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
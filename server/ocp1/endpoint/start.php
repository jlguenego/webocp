<?php
	define("SCRIPT_FILE", __FILE__);
	require_once(dirname(dirname(dirname(SCRIPT_FILE))) . '/include/header.inc');

	$_REQUEST = array_merge($_GET, $_POST);
	if (isset($_REQUEST['name']) && isset($_REQUEST['url']) && isset($_REQUEST['quota'])) {
		$output = array();
		try {
			$ip = get_public_ip();
			$coord = get_geoloc($ip);

			$ocp = new OCP();
			$ocp->hydrate($_REQUEST);
			$ocp->set_coord($coord);
			$ocp->generate_start_address();
			if (isset($_REQUEST['sponsor']) && $_REQUEST['sponsor'] != '') {
				debug('informing sponsor ' . $_REQUEST['sponsor']);
				debug('I am ' . $ocp->name);
				$ocp->inform_sponsor();
			}

			$ocp->store();

			$output['result'] = $ocp;
		} catch (Exception $e) {
			$output['error'] = $e->getMessage();
		}
		debug_r('OUTPUT', $output);
		$result = prettyPrint(json_encode($output));
		echo $result;
		exit;
	}
	header("Content-Type:text/html; charset=UTF-8;");
	//print_r($_SERVER);
	$name = OCP::get_name_from_url($_SERVER['REQUEST_URI']);
	$url = 'http://' . $_SERVER['HTTP_HOST'] . preg_replace('#(.*' . $name . ')/endpoint.*#', "$1", $_SERVER['REQUEST_URI']);
?>

<!DOCTYPE html>
<html>
	<head>
	</head>

	<body>
		<form method="GET" action="">
			Name: <input type="text" name="name" value="<?php echo $name; ?>"/><br />
			URL: <input type="text" name="url" value="<?php echo $url; ?>" size="100"/>(url where I can be reached.)<br />
			Sponsor: <input type="text" name="sponsor" value="http://localhost/webocp/server/test" size="100"/><br />
			Quota: <input type="number" name="quota" value="1" size="100"/> GB<br />
			<input type="submit" value="Submit" />
		</form>
	</body>
</html>
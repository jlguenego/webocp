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
	if (isset($_REQUEST['name']) && isset($_REQUEST['url'])) {
		$output = array();
		try {
			$ocp = new OCP();
			$ocp->hydrate($_REQUEST);
			$ocp->generate_start_address();
			if (isset($_REQUEST['sponsor']) && $_REQUEST['sponsor'] != '') {
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
	$url = 'http://' . $_SERVER['HTTP_HOST'] . preg_replace('#(.*node[\d]+).*#', "$1", $_SERVER['REQUEST_URI']);
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
			<input type="submit" value="Submit" />
		</form>
	</body>
</html>
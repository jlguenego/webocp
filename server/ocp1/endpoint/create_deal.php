<?php
	define("SCRIPT_FILE", __FILE__);
	require_once(dirname(dirname(dirname(SCRIPT_FILE))) . '/include/header.inc');

	if (isset($_REQUEST['name']) && isset($_REQUEST['url']) && isset($_REQUEST['quota'])) {
		try {
			$ocp = new OCP();
			$ocp->load(OCP::get_name_from_url($_SERVER['REQUEST_URI']));
			$deal = array(
				'OK',
			);
			$output['result'] = $deal;
		} catch (Exception $e) {
			$output['error'] = $e->getMessage();
		}
		debug_r('output', $output);
		$result = json_encode($output);
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
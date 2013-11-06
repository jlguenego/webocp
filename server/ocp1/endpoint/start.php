<?php
	define("SCRIPT_FILE", __FILE__);
	require_once(dirname(dirname(dirname(SCRIPT_FILE))) . '/include/header.inc');

	$_REQUEST = array_merge($_GET, $_POST);

	if (isset($_REQUEST['name']) && isset($_REQUEST['url']) && isset($_REQUEST['quota'])) {
		$output = array();
		try {
			if (!isset($_REQUEST['b_lan'])) {
				$_REQUEST['lan_url'] = '';
			}

			$url = parse_url($_REQUEST['url']);
			$coord = get_geoloc(gethostbyname($url['host']));

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
			if ($_REQUEST['lan_url'] != '') {
				$lan_url = parse_url($_REQUEST['lan_url']);
				upnp_expose_server($url, $lan_url);
			}

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

	// Two cases:
	// 1) both client and server in the same LAN.
	// 2) client and server on different LAN.
	$server_address_spec = null;
	$b_inside_the_same_lan = inside_the_same_lan();
	if ($b_inside_the_same_lan) {
		$server_address_spec = array(
			'private_ip' => $_SERVER['SERVER_NAME'],
			'private_port' => $_SERVER['SERVER_PORT'],
			'public_ip' => get_public_ip(),
			'public_port' => $_SERVER['SERVER_PORT'],
		);
	} else {
		$server_address_spec = array(
			'public_ip' => get_public_ip(),
			'public_port' => $_SERVER['SERVER_PORT'],
		);
	}

	$name = OCP::get_name_from_url($_SERVER['REQUEST_URI']);
	$url = 'http://' . $server_address_spec['public_ip'] . ':' . $server_address_spec['public_port']. preg_replace('#(.*' . $name . ')/endpoint.*#', "$1", $_SERVER['REQUEST_URI']);
	$lan_url = '';
	if ($b_inside_the_same_lan) {
		$lan_url = 'http://' . $server_address_spec['private_ip'] . ':' . $server_address_spec['private_port']. preg_replace('#(.*' . $name . ')/endpoint.*#', "$1", $_SERVER['REQUEST_URI']);
	}
?>

<!DOCTYPE html>
<html>
	<head>
	</head>

	<body>
		<form method="GET" action="">
			<table>
				<tr>
					<td>Name</td>
					<td><input type="text" name="name" value="<?php echo $name; ?>"/></td>
				</tr>
				<tr>
					<td>URL</td>
					<td><input type="text" name="url" value="<?php echo $url; ?>" size="100"/>(url where I can be reached.)</td>
				</tr>
				<tr>
					<td>Can be contacted through LAN</td>
					<td><input type="checkbox" name="b_lan" /></td>
				</tr>
				<tr>
					<td>LAN URL</td>
					<td><input type="text" name="lan_url" value="<?php echo $lan_url; ?>" size="100"/></td>
				</tr>
				<tr>
					<td>Sponsor URL</td>
					<td><input type="text" name="sponsor" value="http://www.ocpforum.org/webocp/server/node0" size="100"/></td>
				</tr>
				<tr>
					<td>Quota</td>
					<td><input type="number" name="quota" value="1" size="100"/> GB</td>
				</tr>
			</table>
			<input type="submit" value="Submit" />
		</form>
	</body>
</html>
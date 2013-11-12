<?php
	function is_private_ip($ip) {
		if (is_private_ipv6($ip)) {
			return true;
		}

		$pri_addrs = array(
			'10.0.0.0|10.255.255.255',
			'172.16.0.0|172.31.255.255',
			'192.168.0.0|192.168.255.255',
			'169.254.0.0|169.254.255.255',
			'127.0.0.0|127.255.255.255'
		);

		$long_ip = ip2long($ip);
		if($long_ip != -1) {
			foreach($pri_addrs AS $pri_addr) {
				list($start, $end) = explode('|', $pri_addr);

				// IF IS PRIVATE
				if($long_ip >= ip2long($start) && $long_ip <= ip2long($end)) {
					return TRUE;
				}
			}
		}

		return FALSE;
	}

	function is_ipv4($ip) {
		return filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4);
	}

	function get_public_ip() {
		$ip = $_SERVER['SERVER_ADDR'];

		if (is_ipv4($ip) && !is_private_ip($ip)) {
			debug('SERVER_ADDR');
			return $ip;
		}

		$ip = get_public_ip_from_cache();
		if ($ip != null) {
			debug('get_public_ip_from_cache');
			return $ip;
		}

		$ip = get_public_ip_with_upnp();
		if ($ip != null) {
			debug('get_public_ip_with_upnp');
			store_cached_ip($ip);
			return $ip;
		}

		$ip = get_public_ip_from_web();
		if ($ip != null) {
			debug('get_public_ip_from_web');
			store_cached_ip($ip);
			return $ip;
		}

		debug('SERVER_ADDR 2');

		return $_SERVER['SERVER_ADDR'];
	}

	function get_public_ip_with_upnp() {
		$upnp = new Upnp();
		$service_type = 'urn:schemas-upnp-org:service:WANPPPConnection:1';
		$upnp->discover();

		if (!$upnp->hasService($service_type)) {
			return null;
		}

		$service = $upnp->getService($service_type);
		$action = 'GetExternalIPAddress';
		$args = array();
		$output = $service->sendRequest($action, $args);

		$dom = new DOMDocument();
		$dom->loadXML($output);

		$result = $dom->textContent;
		return $result;
	}

	function get_public_ip_from_cache() {
		$cache = new Cache();
		$result = $cache->get('public_ip');

		return $result;
	}

	function get_public_ip_from_web() {
		$ip = file_get_contents('http://api.externalip.net/ip');
		return $ip;
	}

	function store_cached_ip($ip) {
		$cache = new Cache();
		$cache->set('public_ip', $ip, 86400);
	}


	function upnp_expose_server($public, $private) {
		$upnp = new Upnp();

		$service_type = 'urn:schemas-upnp-org:service:WANPPPConnection:1';

		$service = $upnp->getService($service_type);

		$action = 'AddPortMapping';
		$args = array(
			'NewRemoteHost' => '',
			'NewExternalPort' =>  $public['port'],
			'NewProtocol' =>  'TCP',
			'NewInternalPort' =>  $private['port'],
			'NewInternalClient' => gethostbyname($private['host']),
			'NewEnabled' => 'True',
			'NewPortMappingDescription' => OCP_PORT_MAPPING_DESCR,
			'NewLeaseDuration' => '0',
		);

		$output = $service->sendRequest($action, $args);

		$dom = new DOMDocument();
		$dom->loadXML($output);
		echo $dom->textContent;
		return $result;
	}

	function inside_the_same_lan() {
		$client_address = $_SERVER['REMOTE_ADDR'];
		if (is_private_ip($client_address)) {
			return true;
		}

		$server_public_address = get_public_ip();

		return $client_address == $server_public_address;
	}
?>
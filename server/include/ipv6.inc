<?php
	function ipv6_to_canonical($ip) {
		$array = explode('::', $ip);

		if (count($array) > 2) {
			throw new Exception('Malformed ipv6: ' . $ip);
		}
		$new_array = array();
		$c = 0;
		foreach ($array as $value) {
			$a = explode(':', $value);
			$c += count($a);
			$new_a = array();
			foreach ($a as $v) {
				$p = str_pad($v, 4, "0", STR_PAD_LEFT);
				$new_a[] = strtolower($p);
			}
			$new_array[] = join(':', $new_a);
		}

		if (count($array) == 2) {
			$remaining_group_nbr = 8 - $c;
			$remaining_zero_group = array();
			for ($i = 0; $i < $remaining_group_nbr; $i++) {
				$remaining_zero_group[] = '0000';
			}
			array_splice($new_array, 1, 0, $remaining_zero_group);
		}

		return join(':', $new_array);
	}

	function is_private_ipv6($ip) {
		$ipv6_ranges = array(
			'::1/128', // eq to 127.0.0.1
			'fe80::/10',
			// 'fe80::/64',
			'fc00::/7',
			// 'fd00::/8',
		);

		foreach ($ipv6_ranges as $range) {
			if (ipv6_cidr_match($ip, $range)) {
				return true;
			}
		}
		return false;
	}

	function ipv6_cidr_match($ip, $range) {
		$array = explode('/', $range);
		if (count($array) != 2) {
			throw new Exception('Range is not in CIDR notation.');
		}
		list($mask_ip, $prefix_length) = $array;
		$mask_ip_bin = ipv6_to_bin($mask_ip);
		$mask_prefix = substr($mask_ip_bin, 0, $prefix_length);
		$ip_prefix = substr(ipv6_to_bin($ip), 0, $prefix_length);

		return $mask_prefix == $ip_prefix;
	}

	function ipv6_to_bin($ip) {
		$ip = ipv6_to_canonical($ip);
		$array = explode(':', $ip);

		$new_array = array();
		foreach ($array as $group) {
		 	$new_array[] = str_pad(base_convert($group, 16, 2), 16, "0", STR_PAD_LEFT);
		}

		return join('', $new_array);
	}
?>
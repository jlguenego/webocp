<?php
	function is_private_ip($ip) {
		$ip = trim($ip);

		$ip_a = explode('.', $ip);
		if (count($ip_a) != 4) {
			throw new Exception('Wrong ip format.');
		}

		if ($ip_a[0] == 10) {
			return true;
		}

		if ($ip_a[0] == 172) {
			if ($ip_a[1] >= 16 && $ip_a[1] <= 31) {
				return true;
			}
		}

		if ($ip_a[0] == 192 && $ip_a[1] == 168) {
			return true;
		}

		return false;
	}
?>
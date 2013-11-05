<?php
	echo "I'm the client.\n";

	$port = 1234;
	$address = '127.0.0.1';

	$fp = stream_socket_client('udp://' . $address . ':' . $port, $errno, $errstr);
	if (!$fp) {
		echo "ERROR: $errno - $errstr<br />\n";
	}
//	 else {
//		fwrite($fp, "\n");
//		echo fread($fp, 26);
//		fclose($fp);
//	}

	while ($fp) {
		$in = fgets(STDIN);
		fwrite($fp, $in . "\n");
		//fwrite($fp, "\n");
		echo 'Server said: ' . fread($fp, 26) . "\n";
	}
	fclose($fp);
?>
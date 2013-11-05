<?php
	echo "I'm the server\n";
	set_time_limit(0);

	/* Turn on implicit output flushing so we see what we're getting
	 * as it comes in. */
	ob_implicit_flush();

	$address = '127.0.0.1';
	$port = 1234;

	$socket = stream_socket_server('udp://' . $address . ':' . $port, $errno, $errstr, STREAM_SERVER_BIND);
	if (!$socket) {
		die("$errstr ($errno)");
	}

	$pkt = true;
	while ($pkt !== false) {
		$pkt = trim(stream_socket_recvfrom($socket, 1024, 0, $peer));
		echo $peer . ' said: ' . $pkt . "\n";
		stream_socket_sendto($socket, $pkt, 0, $peer);
	}
?>
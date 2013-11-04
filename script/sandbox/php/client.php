<?php
	echo "I'm the client.\n";

	$port = 1234;
	$address = '127.0.0.1';

	$socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);

	if ($socket === false) {
	    echo "socket_create() failed: reason: " . socket_strerror(socket_last_error()) . "\n";
	} else {
	    echo "OK.\n";
	}

	echo "Attempting to connect to '$address' on port '$port'...";
	$result = socket_connect($socket, $address, $port);
	if ($result === false) {
	    echo "socket_connect() failed.\nReason: ($result) " . socket_strerror(socket_last_error($socket)) . "\n";
	} else {
	    echo "OK.\n";
	}

	$out = '';
	while (($out = @socket_read($socket, 2048)) != false) {
		echo 'from server: ' . $out;
		$in = fgets(STDIN);

		socket_write($socket, $in, strlen($in));
	}

	echo "Closing socket...";
	socket_close($socket);
	echo "OK.\n\n";
?>
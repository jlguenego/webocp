<?php
	echo "I'm the server\n";
	set_time_limit(0);

	/* Turn on implicit output flushing so we see what we're getting
	 * as it comes in. */
	ob_implicit_flush();

	$address = '127.0.0.1';
	$port = 1234;

	if (($sock = socket_create(AF_INET, SOCK_STREAM, SOL_TCP)) === false) {
    	echo "socket_create() failed: reason: " . socket_strerror(socket_last_error()) . "\n";
	}

	if (socket_bind($sock, $address, $port) === false) {
	    echo "socket_bind() failed: reason: " . socket_strerror(socket_last_error($sock)) . "\n";
	}

	if (socket_listen($sock, 5) === false) {
	    echo "socket_listen() failed: reason: " . socket_strerror(socket_last_error($sock)) . "\n";
	}

	$continue = true;
	while ($continue) {
		if (($msgsock = socket_accept($sock)) === false) {
			echo "socket_accept() failed: reason: " . socket_strerror(socket_last_error($sock)) . "\n";
			break;
		}
		/* Send instructions. */
		$msg = "\nWelcome to the PHP Test Server. \n" .
		"To quit, type 'quit'. To shut down the server type 'shutdown'.\n";
		socket_write($msgsock, $msg, strlen($msg));

		while (true) {
			if (false === ($buf = socket_read($msgsock, 2048, PHP_NORMAL_READ))) {
				echo "socket_read() failed: reason: " . socket_strerror(socket_last_error($msgsock)) . "\n";
				$continue = false;
				break;
			}
			if (!$buf = trim($buf)) {
				continue;
			}
			if ($buf == 'quit') {
				break;
			}
			if ($buf == 'shutdown') {
				socket_close($msgsock);
				$continue = false;
				break;
			}
			$talkback = "PHP: You said '$buf'.\n";
			socket_write($msgsock, $talkback, strlen($talkback));
			echo "$buf\n";
		}
		socket_close($msgsock);
	}

	socket_close($sock);
?>
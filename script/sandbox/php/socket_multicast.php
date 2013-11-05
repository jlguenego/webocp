<?php
	$st = 'ssdp:all';
	$mx = 2;
	$man = 'ssdp:discover';
	$from = null;
	$port = null;
	$sockTimout = 5;
	// BUILD MESSAGE
    $msg  = 'M-SEARCH * HTTP/1.1' . "\r\n";
    $msg .= 'HOST: 239.255.255.250:1900' ."\r\n";
    $msg .= 'MAN: "'. $man .'"' . "\r\n";
    $msg .= 'MX: '. $mx ."\r\n";
    $msg .= 'ST:' . $st ."\r\n";
   // $msg .= 'USER-AGENT: '. static::USER_AGENT ."\r\n";
    $msg .= '' ."\r\n";

    // MULTICAST MESSAGE
    $sock = socket_create( AF_INET, SOCK_DGRAM, 0 );
    $opt_ret =  socket_set_option($sock, SOL_SOCKET, SO_REUSEADDR, TRUE);
    $send_ret = socket_sendto( $sock, $msg, strlen( $msg ), 0, '239.255.255.250', 1900);

    // SET TIMEOUT FOR RECIEVE
    socket_set_option( $sock, SOL_SOCKET, SO_RCVTIMEO, array( 'sec'=>$sockTimout, 'usec'=>'0' ) );

    // RECIEVE RESPONSE
    while(true) {
        $buf = null;
        @socket_recvfrom( $sock, $buf, 1024, MSG_WAITALL, $from, $port );
        if( is_null($buf) ) {
        	break;
        }
        echo $buf . "----------------------------\n";
    }

    // CLOSE SOCKET
    socket_close( $sock );
?>
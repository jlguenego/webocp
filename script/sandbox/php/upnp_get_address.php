<?php
function sendRequestToDevice( $method, $arguments, $url = null, $type = 'RenderingControl:1', $hostIp = '127.0.0.1', $hostPort = '80' ) {
	if( is_null( $url ) ) $url = $this->getDefaultURL();

	$body  ='<?xml version="1.0" encoding="utf-8"?>' . "\r\n";
	$body .='<s:Envelope s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">' . "\r\n";
	$body .='   <s:Body>' . "\r\n";
	$body .='      <u:'.$method.' xmlns:u="urn:schemas-upnp-org:service:'.$type.':1">' . "\r\n";

	foreach( $arguments as $arg=>$value ) {
	$body .='         <'.$arg.'>'.$value.'</'.$arg.'>' . "\r\n";
	}

	$body .='      </u:'.$method.'>' . "\r\n";
	$body .='   </s:Body>' . "\r\n";
	$body .='</s:Envelope>' . "\r\n\r\n";

	$header = array(
	'SOAPACTION: "urn:schemas-upnp-org:service:'.$type.'#'.$method,
	'CONTENT-TYPE: text/xml ; charset="utf-8"',
	'HOST: '.$hostIp.':'.$hostPort,
	'Connection: close',
	'Content-Length: ' . strlen($body),
	);

	$ch = curl_init();
	curl_setopt( $ch, CURLOPT_HTTPHEADER, $header );
	curl_setopt( $ch, CURLOPT_RETURNTRANSFER, TRUE );
	curl_setopt( $ch, CURLOPT_URL, $url );
	curl_setopt( $ch, CURLOPT_POST, TRUE );
	curl_setopt( $ch, CURLOPT_POSTFIELDS, $body );

	$response = curl_exec( $ch );
	curl_close( $ch );

	return $respone;
}

function mSearch( $st = 'ssdp:all', $mx = 2, $man = 'ssdp:discover', $from = null, $port = null, $sockTimout = '5' ) {
	// BUILD MESSAGE
	$msg  = 'M-SEARCH * HTTP/1.1' . "\r\n";
	$msg .= 'HOST: 239.255.255.250:1900' ."\r\n";
	$msg .= 'MAN: "'. $man .'"' . "\r\n";
	$msg .= 'MX: '. $mx ."\r\n";
	$msg .= 'ST:' . $st ."\r\n";
	//$msg .= 'USER-AGENT: '. static::USER_AGENT ."\r\n";
	$msg .= '' ."\r\n";

	// MULTICAST MESSAGE
	$sock = socket_create( AF_INET, SOCK_DGRAM, 0 );
	$opt_ret = socket_set_option( $sock, 1, 6, TRUE );
	$send_ret = socket_sendto( $sock, $msg, strlen( $msg ), 0, '239.255.255.250', 1900);

	// SET TIMEOUT FOR RECIEVE
	socket_set_option( $sock, SOL_SOCKET, SO_RCVTIMEO, array( 'sec'=>$sockTimout, 'usec'=>'0' ) );

	// RECIEVE RESPONSE
	$response = array();
	do {
	$buf = null;
	@socket_recvfrom( $sock, $buf, 1024, MSG_WAITALL, $from, $port );
	if( !is_null($buf) )$response[] = parseMSearchResponse( $buf );
	} while( !is_null($buf) );

	// CLOSE SOCKET
	socket_close( $sock );

	return $response;
}

private function parseMSearchResponse( $response ) {
	$responseArr = explode( "\r\n", $response );

	$parsedResponse = array();

	foreach( $responseArr as $row ) {
		if( stripos( $row, 'http' ) === 0 )
			$parsedResponse['http'] = $row;

		if( stripos( $row, 'cach' ) === 0 )
			$parsedResponse['cache-control'] = str_ireplace( 'cache-control: ', '', $row );

		if( stripos( $row, 'date') === 0 )
			$parsedResponse['date'] = str_ireplace( 'date: ', '', $row );

		if( stripos( $row, 'ext') === 0 )
			$parsedResponse['ext'] = str_ireplace( 'ext: ', '', $row );

		if( stripos( $row, 'loca') === 0 )
			$parsedResponse['location'] = str_ireplace( 'location: ', '', $row );

		if( stripos( $row, 'serv') === 0 )
			$parsedResponse['server'] = str_ireplace( 'server: ', '', $row );

		if( stripos( $row, 'st:') === 0 )
			$parsedResponse['st'] = str_ireplace( 'st: ', '', $row );

		if( stripos( $row, 'usn:') === 0 )
			$parsedResponse['usn'] = str_ireplace( 'usn: ', '', $row );

		if( stripos( $row, 'cont') === 0 )
			$parsedResponse['content-length'] = str_ireplace( 'content-length: ', '', $row );
	}

	return $parsedResponse;
}
?>
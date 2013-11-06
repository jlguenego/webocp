<?php
class Upnp {
	private $services = array();

	public function discover() {
		$st = 'ssdp:all';
		$mx = 2;
		$man = 'ssdp:discover';
		$from = null;
		$port = null;
		$sockTimout = 1;

		// BUILD MESSAGE
	    $msg  = 'M-SEARCH * HTTP/1.1' . "\r\n";
	    $msg .= 'HOST: 239.255.255.250:1900' . "\r\n";
	    $msg .= 'MAN: "'. $man .'"' . "\r\n";
	    $msg .= 'MX: '. $mx . "\r\n";
	    $msg .= 'ST:' . $st . "\r\n";
		// $msg .= 'USER-AGENT: '. static::USER_AGENT . "\r\n";
	    $msg .= '' . "\r\n";

	    // MULTICAST MESSAGE
	    if (!function_exists('socket_create')) {
	    	throw new Exception('php_sockets module non installed.');
	    }
	    $sock = socket_create( AF_INET, SOCK_DGRAM, 0 );
	    $opt_ret =  socket_set_option($sock, SOL_SOCKET, SO_REUSEADDR, TRUE);
	    $send_ret = socket_sendto( $sock, $msg, strlen( $msg ), 0, '239.255.255.250', 1900);

	    // SET TIMEOUT FOR RECIEVE
	    socket_set_option( $sock, SOL_SOCKET, SO_RCVTIMEO, array( 'sec'=>$sockTimout, 'usec'=>'0' ) );

	    // RECEIVE RESPONSE
	    while (true) {
	        $buf = null;
	        @socket_recvfrom( $sock, $buf, 1024, MSG_WAITALL, $from, $port );
	        if (is_null($buf)) {
	        	break;
	        }
	        $this->services[] = new UpnpService($buf);
	    }

	    // CLOSE SOCKET
	    socket_close( $sock );
	}

	public function hasService($service_type) {
		foreach ($this->services as $service) {
			if ($service->getType() == $service_type) {
				return true;
			}
		}
		return false;
	}

	public function getService($service_type) {
		$cache = new Cache();
		$service_str = $cache->get($service_type);

		if ($service_str != null) {
			$service = unserialize(base64_decode($service_str));
			return $service;
		}

		$this->discover();
		$result = null;

		foreach ($this->services as $service) {
			if ($service->getType() == $service_type) {
				$result = $service;
				break;
			}
		}

		if ($result == null) {
			throw new Exception('SSDP ' . $service_type . ' service not found.');
		}
		$str = base64_encode(serialize($result));
		debug($str);
		$cache->set($service_type, $str);
		return $result;
	}
}

class UpnpService {
	private $http;
	private $cache_control;
	private $date;
	private $ext;
	private $location;
	private $ip;
	private $port;
	private $server;
	private $st;
	private $usn;
	private $content_length;

	public function __construct($str) {
		$responseArr = explode( "\r\n", $str );

		foreach( $responseArr as $row ) {
			if( stripos( $row, 'http' ) === 0 )
				$this->http = trim($row);

			if( stripos( $row, 'cache-control:' ) === 0 )
				$this->cache_control = trim(str_ireplace( 'cache-control:', '', $row ));

			if( stripos( $row, 'date:') === 0 )
				$this->date = trim(str_ireplace( 'date:', '', $row ));

			if( stripos( $row, 'ext:') === 0 )
				$this->ext = trim(str_ireplace( 'ext:', '', $row ));

			if( stripos( $row, 'location:') === 0 ) {
				$this->location = trim(str_ireplace( 'location:', '', $row ));

				$url = parse_url($this->location);
				$this->ip = gethostbyname($url['host']);
				$this->port = $url['port'];
			}

			if( stripos( $row, 'server:') === 0 )
				$this->server = trim(str_ireplace( 'server:', '', $row ));

			if( stripos( $row, 'st:') === 0 )
				$this->st = trim(str_ireplace( 'st: ', '', $row ));

			if( stripos( $row, 'usn:') === 0 )
				$this->usn = trim(str_ireplace( 'usn: ', '', $row ));

			if( stripos( $row, 'content-length:') === 0 )
				$this->content_length = trim(str_ireplace( 'content-length: ', '', $row ));
		}
	}

	public function getType() {
		return $this->st;
	}

	public function sendRequest($action, $args) {
		$body  = <<<EOF
<?xml version="1.0" encoding="utf-8"?>
<s:Envelope s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
	<s:Body>
		<u:${action} xmlns:u="{$this->st}">

EOF;

		foreach( $args as $arg => $value ) {
			$body .=<<<EOF
			<${arg}>${value}</${arg}>

EOF;
		}

		$body .= <<<EOF
		</u:${action}>
	</s:Body>
</s:Envelope>
EOF;

		$header = array(
			'SOAPACTION: ' . $this->st . '#' . $action,
			'CONTENT-TYPE: text/xml ; charset="utf-8"',
			'HOST: ' . $this->ip . ':' . $this->port,
			'Connection: close',
			'Content-Length: ' . strlen($body),
		);
		//echo "\nHEADER:\n" . join($header, "\n"). "\n---------------------------\n";
		//echo "BODY:\n" . $body . "\n\n\n";

		$ch = curl_init();
		curl_setopt( $ch, CURLOPT_HTTPHEADER, $header );
		curl_setopt( $ch, CURLOPT_RETURNTRANSFER, TRUE );
		curl_setopt( $ch, CURLOPT_URL, $this->location );
		curl_setopt( $ch, CURLOPT_POST, TRUE );
		curl_setopt( $ch, CURLOPT_POSTFIELDS, $body );

		$response = curl_exec( $ch );
		curl_close( $ch );

		return $response;
	}
}
?>
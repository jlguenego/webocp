<?php
	require_once(BASE_DIR . '/include/format.inc');

	function ls($dirname) {
		$result = array();
		 foreach(scandir($dirname) as $file) {
			if ('.' === $file || '..' === $file) {
				continue;
			}
			$file = utf8_encode($file);
			$result[] = $file;
	    }
		return $result;
	}

	function rm_rf($dir) {
		if (!is_dir($dir)) {
			if (is_file($dir)) {
				unlink("$dir");
			}
			return;
		}
	    foreach(scandir($dir) as $file) {
			if ('.' === $file || '..' === $file) {
				continue;
			}
			if (is_dir("$dir/$file")) {
				rm_rf("$dir/$file");
			} else {
				unlink("$dir/$file");
			}
	    }
	    if (is_dir($dir)) {
	    	rmdir($dir);
	    }
	}

	function get_file($input_name, $i) {
		if (!array_key_exists($input_name, $_FILES)) {
			throw new Exception("Cannot retrieve file uploaded with fieldname=$filename");
		}
		if ($_FILES[$input_name]["error"][$i] > 0) {
			if ($_FILES[$input_name]["error"][$i] == 1) {
				throw new Exception(" The uploaded file exceeds the upload_max_filesize directive in php.ini.	");
			}
			throw new Exception("Error while retrieving the uploaded files: ".$_FILES[$input_name]["error"][$i]);
		}
		$file = $_FILES[$input_name]["tmp_name"][$i];
		if (!file_exists($file)) {
			throw new Exception("Error, cannot find the uploaded file.");
		}
		return $file;
	}

	function debug_on($switch = true) {
		global $g_debug;
		$g_debug = $switch;
	}

	function debug($msg, $e = null) {
		global $g_debug;

		if ($g_debug) {
			if ($e == null) {
				$e = new Exception("");
			}
			$trace_array = $e->getTrace();
			$trace = $trace_array[0];
			$function = "";
			if (isset($trace_array[1])) {
				$function = ' ' . $trace_array[1]["function"];
			}
			$txt = "[DEBUG] [". basename($trace["file"]).":".$trace["line"].$function.']'.
				PHP_EOL . "\t".$msg;

			$log_file = 'log.txt';
			if (defined('SCRIPT_NAME')) {
				$log_file = 'log_' . SCRIPT_NAME . '.txt';
			}
			file_put_contents(LOG_FILE_DIR . '/' . $log_file, $txt . PHP_EOL . PHP_EOL, FILE_APPEND);
		}
	}

	function debug_r($msg, $array) {
		global $g_debug;
		if (!$g_debug) {
			return;
		}
		ob_start();
		print_r($array);
		$content = ob_get_contents();
		ob_clean();
		debug('debug_r ' . $msg . PHP_EOL . $content, new Exception(""));
	}

	function check_post_max() {
		if (empty($_POST)) {
			$file_size = format_size($_GET['file_size']);
			throw new Exception('File is too large.... file_size=' . $file_size . ' > post_max_size=' . ini_get('post_max_size'));
		}
	}

	function mkdir_p($path) {
		@mkdir($path, 0777, true);
	}

    if (!function_exists('http_response_code')) {
        function http_response_code($code = NULL) {
            if ($code !== NULL) {
                switch ($code) {
                    case 100: $text = 'Continue'; break;
                    case 101: $text = 'Switching Protocols'; break;
                    case 200: $text = 'OK'; break;
                    case 201: $text = 'Created'; break;
                    case 202: $text = 'Accepted'; break;
                    case 203: $text = 'Non-Authoritative Information'; break;
                    case 204: $text = 'No Content'; break;
                    case 205: $text = 'Reset Content'; break;
                    case 206: $text = 'Partial Content'; break;
                    case 300: $text = 'Multiple Choices'; break;
                    case 301: $text = 'Moved Permanently'; break;
                    case 302: $text = 'Moved Temporarily'; break;
                    case 303: $text = 'See Other'; break;
                    case 304: $text = 'Not Modified'; break;
                    case 305: $text = 'Use Proxy'; break;
                    case 400: $text = 'Bad Request'; break;
                    case 401: $text = 'Unauthorized'; break;
                    case 402: $text = 'Payment Required'; break;
                    case 403: $text = 'Forbidden'; break;
                    case 404: $text = 'Not Found'; break;
                    case 405: $text = 'Method Not Allowed'; break;
                    case 406: $text = 'Not Acceptable'; break;
                    case 407: $text = 'Proxy Authentication Required'; break;
                    case 408: $text = 'Request Time-out'; break;
                    case 409: $text = 'Conflict'; break;
                    case 410: $text = 'Gone'; break;
                    case 411: $text = 'Length Required'; break;
                    case 412: $text = 'Precondition Failed'; break;
                    case 413: $text = 'Request Entity Too Large'; break;
                    case 414: $text = 'Request-URI Too Large'; break;
                    case 415: $text = 'Unsupported Media Type'; break;
                    case 500: $text = 'Internal Server Error'; break;
                    case 501: $text = 'Not Implemented'; break;
                    case 502: $text = 'Bad Gateway'; break;
                    case 503: $text = 'Service Unavailable'; break;
                    case 504: $text = 'Gateway Time-out'; break;
                    case 505: $text = 'HTTP Version not supported'; break;
                    default:
                        exit('Unknown http status code "' . htmlentities($code) . '"');
                    break;
                }
                $protocol = (isset($_SERVER['SERVER_PROTOCOL']) ? $_SERVER['SERVER_PROTOCOL'] : 'HTTP/1.0');
                header($protocol . ' ' . $code . ' ' . $text);
                $GLOBALS['http_response_code'] = $code;
            } else {
                $code = (isset($GLOBALS['http_response_code']) ? $GLOBALS['http_response_code'] : 200);
            }
            return $code;
        }
    }

    function prettyPrint($json) {
	    $result = '';
	    $level = 0;
	    $prev_char = '';
	    $in_quotes = false;
	    $ends_line_level = NULL;
	    $json_length = strlen( $json );

	    for( $i = 0; $i < $json_length; $i++ ) {
	        $char = $json[$i];
	        $new_line_level = NULL;
	        $post = "";
	        if( $ends_line_level !== NULL ) {
	            $new_line_level = $ends_line_level;
	            $ends_line_level = NULL;
	        }
	        if( $char === '"' && $prev_char != '\\' ) {
	            $in_quotes = !$in_quotes;
	        } else if( ! $in_quotes ) {
	            switch( $char ) {
	                case '}': case ']':
	                    $level--;
	                    $ends_line_level = NULL;
	                    $new_line_level = $level;
	                    break;

	                case '{': case '[':
	                    $level++;
	                case ',':
	                    $ends_line_level = $level;
	                    break;

	                case ':':
	                    $post = " ";
	                    break;

	                case " ": case "\t": case "\n": case "\r":
	                    $char = "";
	                    $ends_line_level = $new_line_level;
	                    $new_line_level = NULL;
	                    break;
	            }
	        }
	        if( $new_line_level !== NULL ) {
	            $result .= "\n".str_repeat( "\t", $new_line_level );
	        }
	        $result .= $char.$post;
	        $prev_char = $char;
	    }

	    return $result;
	}

	function get_geoloc($ip) {
		$cache = new Cache();
		$result = $cache->get('geoloc');
		if ($result) {
			return $result;
		}

		$json = json_decode(file_get_contents('http://freegeoip.net/json/' . $ip, false, $context));
		// Add impresision
		$impresision_lat = rand(-1000, 1000) / 100000;
		$impresision_lng = rand(-1000, 1000) / 100000;

		if ($json->latitude == null || $json->longitude == null) {
			// Orléan
			$json->latitude = 47.9029640;
			$json->longitude = 1.9092510;
		}

		$json->latitude += $impresision_lat;
		$json->longitude += $impresision_lng;
		$loc = array(
			'type' => 'Point',
			'coordinate' => array($json->longitude, $json->latitude),
		);

		$result = json_encode($loc);

		$cache->set('geoloc', $result, 86400);
		return $result;
	}
?>
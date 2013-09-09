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

	function debug($msg) {
		file_put_contents(LOG_FILE_PATH, $msg . PHP_EOL, FILE_APPEND);
	}

	function debug_r($msg, $array) {
		debug($msg);
		ob_start();
		print_r($array);
		$content = ob_get_contents();
		ob_clean();
		debug($content);
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
?>
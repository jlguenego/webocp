<?php
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

	function get_file($input_name) {
		if (!array_key_exists($input_name, $_FILES)) {
			throw new Exception("Cannot retrieve file uploaded with fieldname=$filename");
		}
		if ($_FILES[$input_name]["error"] > 0) {
			throw new Exception("Error while retrieving the uploaded files: ".$_FILES[$input_name]["error"]);
		}
		$file = $_FILES[$input_name]["tmp_name"];
		if (!file_exists($file)) {
			throw new Exception("Error, cannot find the uploaded file.");
		}
		return $file;
	}
?>
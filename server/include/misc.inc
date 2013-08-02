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
			echo "is not dir\n";
			if (is_file($dir)) {
				echo "is file\n";
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
?>
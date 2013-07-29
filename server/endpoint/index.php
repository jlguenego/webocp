<?php
	//é
	header('Access-Control-Allow-Origin: *');
	header("Content-Type:text/plain; charset=UTF-8;");
	define('ROOT', '../data');

	//sleep(2);
	$path = ROOT.$_GET['path'];
	$list = ls($path);
	$files = array();

	foreach ($list as $filename) {
		//echo $filename.'	';
		$file = array(
			'name' => $filename,
			'label' => $filename,
		);
		$win_filename = iconv('UTF-8', 'CP1252', $filename);
		if (is_dir($path.'/'.$win_filename)) {
			$file['type'] = 'dir';
		} else {
			$file['type'] = 'file';
		}
		$files[] = $file;
	}
	echo json_encode($files);

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
?>
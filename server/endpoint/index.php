<?php
	//é
	error_reporting(E_ERROR|E_WARNING|E_PARSE);
	header('Access-Control-Allow-Origin: *');
	header("Content-Type:text/plain; charset=UTF-8;");
	define('ROOT', '../data');

	//sleep(2);
	$path = ROOT.$_GET['path'];
	$path = iconv('UTF-8', 'CP1252', $path);
	$list = ls($path);
	$files = array();

	foreach ($list as $filename) {
		$win_filename = iconv('UTF-8', 'CP1252', $filename);
		$file = array(
			'name' => $filename,
			'label' => $filename,
		);

		if (preg_match('#\.pdf$#', $filename)) {
			$file['mime_type'] = 'application/pdf';
		}

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
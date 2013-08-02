<?php
	//é
	error_reporting(E_ERROR|E_PARSE);
	header('Access-Control-Allow-Origin: *');
	header("Content-Type:text/plain; charset=UTF-8;");

	require_once('../include/misc.inc');

	define('ROOT', '../../../webocp_data/data');

	$_GET = array_merge($_GET, $_POST);

	//sleep(2);
	try {
		$action = $_GET['action'];
		switch($action) {
			case 'ls':
				action_ls();
				break;
			case 'mkdir':
				action_mkdir();
				break;
			case 'mv':
				action_mv();
				break;
			case 'rm':
				action_rm();
				break;
			case 'upload_file':
				action_upload_file();
				break;
			default:
				throw new Exception('Unknown action: ' . $_GET['action']);
		}
	} catch (Exception $e) {
		$output = array();
		$output['error'] = $e->getMessage();
		$result = json_encode($output);
		echo $result;
	}


	function action_mkdir() {
		$output = array();
		try {
			$path = ROOT.$_GET['path'];
			$name = $_GET['name'];
			if (!mkdir($path . '/' . $name)) {
				throw new Exception('Cannot create the folder with path: ' . $path);
			}
		} catch (Exception $e) {
			$output['error'] = $e->getMessage();
		}
		$result = json_encode($output);
		echo $result;
	}

	function action_mv() {
		$output = array();
		try {
			$old_path = $_GET['old_path'];
			$new_path = $_GET['new_path'];
			if (file_exists(ROOT.$new_path)) {
				throw new Exception("This file/folder already exists:\n\n" . '"' . $new_path . '"');
			}
			if (!rename(ROOT.$old_path, ROOT.$new_path)) {
				throw new Exception('Cannot rename the file with path: ' . $path);
			}
		} catch (Exception $e) {
			$output['error'] = $e->getMessage();
		}
		$result = json_encode($output);
		echo $result;
	}

	function action_rm() {
		$output = array();
		try {
			$path = $_GET['path'];
			if (!file_exists(ROOT.$path)) {
				throw new Exception("Cannot find the selected file:\n\n" . '"' . $new_path . '"');
			}
			rm_rf(ROOT.$path);
		} catch (Exception $e) {
			$output['error'] = $e->getMessage();
		}
		$result = json_encode($output);
		echo $result;
	}

	function action_ls() {
		$output = array();
		try {
			$path = ROOT.$_GET['path'];
			$path = iconv('UTF-8', 'CP1252', $path);
			$list = ls($path);
			$files = array();

			foreach ($list as $filename) {
				$win_filename = iconv('UTF-8', 'CP1252', $filename);
				$file = array(
					'name' => $filename,
					'label' => $filename,
					'size' => filesize($path.'/'.$filename),
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
			$output['result'] = $files;
		} catch (Exception $e) {
			$output['error'] = $e->getMessage();
		}
		$result = json_encode($output);
		echo $result;
	}

	function action_upload_file() {
		$path = $_GET['path'];
		if (file_exists(ROOT.$path)) {
			throw new Exception("This file already exists:\n\n" . '"' . $path . '"');
		}
		$input_name = $_GET['input_name'];
		$filename = get_file($input_name);
		rename($filename, ROOT.$path);

		echo json_encode(array($_GET, $_FILES));
	}
?>
<?php
	//é
	error_reporting(E_ERROR|E_WARNING|E_PARSE);
	header('Access-Control-Allow-Origin: *');
	header("Content-Type:text/plain; charset=UTF-8;");
	define("BASE_DIR", dirname(dirname(__FILE__)));

	require_once(BASE_DIR . '/include/misc.inc');
	require_once(BASE_DIR . '/include/constant.inc');

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
			case 'upload_dir':
				action_upload_dir();
				break;
			case 'download_file':
				action_download_file();
				break;
			case 'register':
				action_register();
				break;
			case 'login':
				action_login();
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
			debug_r('_GET', $_GET);
			$path = ROOT.$_GET['path'];
			$name = $_GET['name'];
			if (!is_dir($path . '/' . $name)) {
				if (!@mkdir($path . '/' . $name)) {
					throw new Exception('Cannot create the folder with path: ' . $path);
				}
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
			$path = ROOT . $_GET['path'];
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
		debug_r('_GET', $_GET);
		debug_r('_FILES', $_FILES);
		$path = $_GET['path'];
		$input_name = $_GET['input_name'];

		if (!isset($_FILES[$input_name])) {
			throw new Exception("Cannot retrieve file uploaded with fieldname=$filename");
		}

		$file_nbr = count($_FILES[$input_name]['name']);

		for ($i = 0; $i < $file_nbr; $i++) {
			$name = $_FILES[$input_name]['name'][$i];
			$filename = ROOT . $path . '/' . $name;
			$tmp_filename = get_file($input_name, $i);

			if (file_exists($filename)) {
				unlink($filename);
			}
			rename($tmp_filename, $filename);
		}

		echo json_encode(array($_GET, $_FILES));
	}

	function action_upload_dir() {
		debug_r('_GET', $_GET);
		debug_r('_FILES', $_FILES);
		$path = $_GET['path'];
		$relative_path = explode(',', $_GET['relative_path']);
		$input_name = $_GET['input_name'];

		if (!isset($_FILES[$input_name])) {
			throw new Exception("Cannot retrieve file uploaded with fieldname=$filename");
		}

		$file_nbr = count($_FILES[$input_name]['name']);

		for ($i = 0; $i < $file_nbr; $i++) {
			$filename = ROOT . $path . '/' . $relative_path[$i];
			debug('filename=' . $filename);
			$tmp_filename = get_file($input_name, $i);

			if (file_exists($filename)) {
				unlink($filename);
			}


			$dir = dirname($filename);
			if (!is_dir($dir)) {
				if (!@mkdir($dir, 0777, true)) {
					throw new Exception('Cannot create the folder with path: ' . $dir);
				}
			}
			if (!preg_match('#\.$#', $filename)) {
				rename($tmp_filename, $filename);
			} else {
				unlink($tmp_filename);
			}
		}

		echo json_encode(array($_GET, $_FILES));
	}

	function action_register() {
		$output = array();
		try {
			debug_r('_GET', $_GET);
			$root_dir = ROOT . '/' . $_GET['account']['public_object']['address'];
			debug('path='.$root_dir);
			if (is_dir($root_dir)) {
				throw new Exception('This account already exists.');
			}
			if (!@mkdir($root_dir)) {
				throw new Exception('Cannot create your personal folder.');
			}
			$output['result'] = 'OK';
		} catch (Exception $e) {
			$output['error'] = $e->getMessage();
		}
		$result = json_encode($output);
		echo $result;
	}

	function action_login() {
		$output = array();
		try {
			debug_r('_GET', $_GET);
			$root_dir = ROOT . '/' . $_GET['account']['public_object']['address'];
			debug('path='.$root_dir);
			if (!is_dir($root_dir)) {
				throw new Exception('This account does not exist.');
			}
			$output['result'] = 'OK';
		} catch (Exception $e) {
			$output['error'] = $e->getMessage();
		}
		$result = json_encode($output);
		echo $result;
	}
?>
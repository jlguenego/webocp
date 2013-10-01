<?php
	//é
	error_reporting(E_ERROR|E_WARNING|E_PARSE);
	header('Access-Control-Allow-Origin: *');
	header("Content-Type:text/plain; charset=UTF-8;");
	define("BASE_DIR", dirname(dirname(dirname(__FILE__))));

	require_once(BASE_DIR . '/include/constant.inc');
	require_once(BASE_DIR . '/include/global.inc');
	require_once(BASE_DIR . '/include/misc.inc');
	require_once(BASE_DIR . '/include/format.inc');


	define("USER_ROOT", ROOT . '/shared_storage');

	$_REQUEST = array_merge($_GET, $_POST);
	debug_r('_GET', $_GET);

	try {
		mkdir_p(USER_ROOT);

		$action = $_REQUEST['action'];
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
				throw new Exception('Unknown action: ' . $_REQUEST['action']);
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
			$path = ROOT.$_REQUEST['path'];
			$name = $_REQUEST['name'];
			mkdir_p($path . '/' . $name);
		} catch (Exception $e) {
			$output['error'] = $e->getMessage();
		}
		$result = json_encode($output);
		echo $result;
	}

	function action_mv() {
		$output = array();
		try {
			$old_path = $_REQUEST['old_path'];
			$new_path = $_REQUEST['new_path'];
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
			$path = $_REQUEST['path'];
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
			$path = ROOT . $_REQUEST['path'];
			$path = iconv('UTF-8', 'CP1252', $path);
			$list = ls($path);
			$files = array();

			foreach ($list as $filename) {
				$win_filename = iconv('UTF-8', 'CP1252', $filename);
				$file = array(
					'name' => $filename,
					'label' => $filename,
					'size' => filesize($path.'/'.$filename),
					'last_modified' => filemtime($path.'/'.$filename),
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
		check_post_max();
		debug_r('_FILES', $_FILES);
		$path = $_REQUEST['path'];
		$input_name = $_REQUEST['input_name'];

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

		echo json_encode(array($_REQUEST, $_FILES));
	}

	function action_upload_dir() {
		debug_r('_FILES', $_FILES);
		$path = $_REQUEST['path'];
		$relative_path = explode(',', $_REQUEST['relative_path']);
		$input_name = $_REQUEST['input_name'];

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

		echo json_encode(array($_REQUEST, $_FILES));
	}

	function action_register() {
		$output = array();
		try {
			$name = $_REQUEST['name'];
			$email = $_REQUEST['email'];
			$password = $_REQUEST['password'];

			$user_file = ROOT . '/user_file.txt';
			touch($user_file);
			$users = file($user_file);
			foreach ($users as $user) {
				list($user_email, $user_name, $user_password) = explode(':', $user);
				if ($user_email == $email) {
					throw new Exception('This account already exists.');
				}
			}
			file_put_contents($user_file, $email . ':' . $name . ':' . $password . "\n", FILE_APPEND);

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
			$email = $_REQUEST['email'];
			$password = $_REQUEST['password'];

			$user_file = ROOT . '/user_file.txt';
			touch($user_file);
			$users = file($user_file);
			foreach ($users as $line) {
				$line = trim($line);
				list($user_email, $user_name, $user_password) = explode(':', $line);
				debug('email=' . $email);
				debug('password=|' . $password .'|');
				debug('user_email=' . $user_email);
				debug('user_name=' . $user_name);
				debug('user_password=|' . $user_password .'|');
				if (($user_email == $email) && ($user_password == $password)) {
					$output['result'] = 'OK';
					debug('User found: ' . $user_email);
					break;
				}
			}
			if (!isset($output['result'])) {
				debug('Not found.');
				throw new Exception('Bad login/password.');
			}
		} catch (Exception $e) {
			$output['error'] = $e->getMessage();
		}
		$result = json_encode($output);
		echo $result;
	}
?>
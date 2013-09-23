<?php
	function storage_set_root($dir) {
		global $g_storage_root;
		$g_storage_root = $dir;
	}

	function storage_get_root() {
		global $g_storage_root;
		return $g_storage_root;
	}

	function storage_retrieve_path($filename, $dir = null) {
		global $g_storage_root;

		debug('filename=' . $filename);
		debug('dir=' . $dir);

		if ($dir == null) {
			$dir = $g_storage_root;
		}
		debug('dir=' . $dir);

		if (!is_dir($dir)) {
			return false;
		}

		$result = $dir . '/' . $filename;
		if (file_exists($result)) {
			return $result;
		}
		$result = storage_retrieve_path(substr($filename, 2), $dir . '/' . substr($filename, 0, 2));
		if (file_exists($result)) {
			return $result;
		}
		return false;
	}

	function storage_generate_path($filename, $dir = null) {
		global $g_storage_root;

		if ($dir == null) {
			$dir = $g_storage_root;
		}

		if (storage_count_files($dir) < 20) {
			return $dir . '/' . $filename;
		}

		return storage_generate_path(substr($filename, 2), $dir . '/' . substr($filename, 0, 2));
	}

	function storage_count_files($dir) {
		if (!is_dir($dir)) {
			return -1;
		}

		$elements = scandir($dir);
		return count($elements);
	}
?>
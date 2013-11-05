<?php
define('CACHE_FILE', ROOT . '/cache.txt');
class Cache {
	private $file = CACHE_FILE;
	private $json;

	public function __construct() {
		if (file_exists($this->file)) {
			$content = file_get_contents($this->file);
			$this->json = json_decode($content);
		} else {
			$this->json = json_decode('{}');
		}
	}

	public function set($key, $value, $delay = 0) {
		$exp_t = 0;
		if ($delay > 0) {
			$exp_t = $delay + time();
		}

		$this->json->$key = array(
			'value' => $value,
			'exp_t' => $exp_t,
		);
		file_put_contents($this->file, json_encode($this->json));
	}

	public function get($key) {
		debug_r('JSON', $this->json);
		if (!isset($this->json->$key)) {
			return null;
		}

		$pair = $this->json->$key;

		if ($pair->exp_t > 0 && $pair->exp_t < time()) {
			unset($this->json->$key);
			return null;
		}
		return $pair->value;
	}
}
?>
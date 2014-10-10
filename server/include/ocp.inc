<?php
	class OCP {
		public $name;
		public $url;
		public $b_lan;
		public $lan_url;
		public $sponsor;
		public $start_address = null;
		public $contact_list = null;
		public $quota = 0;
		public $location = array();

		public static function get_name_from_url($url) {
			$name = preg_replace('#^.*webocp/server/node/([^/]+).*$#', "$1", $url);
			return $name;
		}

		public function hydrate($array) {
			foreach ($array as $key => $value) {
				$this->$key = $value;
			}
			//debug_r('contact_list', $this->contact_list);
			//debug('typeof contact_list=' . gettype($this->contact_list));
		}

		public function generate_start_address() {
			$this->start_address = sha1($this->name);//sha1(rand(0, 1000000));
		}

		public function get_file() {
			return ROOT . '/conf/' . $this->name . '.json';
		}

		public function get_dir() {
			return WEB_DIR . '/../../webocp_data/ocp1/' . $this->name;
		}

		public function load($name) {
			$this->name = $name;
			$file = $this->get_file($this->name);
			//debug('file2=' . $file);
			if (!is_file($file)) {
				throw new Exception('File not found: ' . $file);
			}
			$content = get_content($file);
			//debug('json file content: ' . $content);
			$object = json_decode($content);
			$this->hydrate($object);
		}

		public function get_json() {
			$conf = array(
				"name" => $this->name,
				"url" => $this->url,
				"b_lan" => $this->b_lan,
				"lan_url" => $this->lan_url,
				"start_address" => $this->start_address,
				"quota" => $this->quota,
				"location" => $this->location,
				"contact_list" => $this->contact_list,
			);
			return prettyPrint(json_encode($conf));
		}

		public function to_contact() {
			return array(
				"name" => $this->name,
				"url" => $this->url,
				"b_lan" => $this->b_lan,
				"lan_url" => $this->lan_url,
				"start_address" => $this->start_address,
				"quota" => $this->quota,
				"location" => $this->location,
			);
		}

		public function store() {
			mkdir_p(dirname($this->get_file($this->name)));
			$content = $this->get_json();
			//debug('About to store JSON: ' . $content);
			file_put_contents($this->get_file($this->name), $content);
	    }

	    public function inform_sponsor() {
			$postdata = http_build_query(array('contact' => base64_encode(json_encode($this->to_contact()))));

			$opts = array(
				'http' => array(
					'method' => "POST",
					'content' => $postdata,
				)
			);
			$context = stream_context_create($opts);

			$response = get_content($this->sponsor . '/endpoint/inform_sponsor', $context);
			//debug_r('Response', $response);
			$response = json_decode($response);
			if (isset($response->error)) {
				throw new Exception($response->error);
			}
			$this->contact_list = $response->result->contact_list;
			//debug_r('Contact_list', $this->contact_list);
	    }

	    public function inform_all($new_contact) {
			$postdata = http_build_query(array('contact' => base64_encode(json_encode($new_contact))));

			$opts = array(
				'http' => array(
					'method' => "POST",
					'content' => $postdata
				)
			);

			debug_r('options', $opts);
			$context = stream_context_create($opts);
			foreach ($this->contact_list as $name => $contact) {
				if ($name == $new_contact->name) {
					continue;
				}
				$url = $this->get_contact_url($contact);
				debug('contact_url=' . $url);
				$response = get_content($url . '/endpoint/add_contact', $context);
				debug('response=' . $response);
			}
	    }

	    public function get_contact_url($contact) {
	    	if (!$contact->b_lan || $contact->lan_url == '') {
	    		return $contact->url;
	    	}

	    	$my_public_url = parse_url($this->url);
	    	$contact_public_url = parse_url($contact->url);

	    	if (gethostbyname($my_public_url['host']) != gethostbyname($contact_public_url['host'])) {
	    		return $contact->url;
	    	}

	    	return $contact->lan_url;
	    }

	    public function get_mem_report() {
	    	$array = array(
	    		'total' => $this->quota * 1000 * 1000 * 1000,
	    		'used' => $this->get_used_mem(),
//	    		'free_space' => @disk_free_space(storage_get_root()),
//	    		'disk_space' => @disk_total_space(storage_get_root()),
//	    		'used_space' => @disk_total_space(storage_get_root()) - @disk_free_space(storage_get_root()),
	    	);
			return $array;
	    }

		public function get_used_mem() {
			$result = 0;
//			$result = $this->foldersize(storage_get_root());	//-------|
			$cmd = 'du -s -B 1 ' . storage_get_root();				//   |
			debug('cmd=' . $cmd);									//   |
			$cmd_result = trim(exec($cmd));							//   |
			$cmd_a = preg_split("#\s+#", $cmd_result);				//   |
			$result = $cmd_a[0];									//   |
			debug('result=' . $result);								//   |
			return $result;											//   |
		}															//   |
																	//   |
		public function foldersize($path) {			//<------------------|
			if (!file_exists($path)) {
				return 0;
			}

			if (is_file($path)) {
				$size = filesize($path);
				$relica = BLOCK_SIZE - ($size % BLOCK_SIZE);
				if ($relica == BLOCK_SIZE) {
					$relica = 0;
				}
				return $size + $relica;
			}
			if (!is_dir($path)) {
				throw new Exception($path . ' is not a dir.');
			}
			$total_size = 0;

			$files = scandir($path);
			$dir = rtrim($path, '/'). '/';

			foreach($files as $file) {
				if ($file == "." && $file == "..") {
					continue;
				}

				$currentFile = $dir . $file;

				$size = $this->foldersize($currentFile);
				$total_size += $size;
			}

			return $total_size;
		}

		public function set_coord($coord) {
			$obj = json_decode($coord);
			//debug_r('test', $obj->coordinate);
			$this->location = $obj->coordinate;
		}
	}
?>
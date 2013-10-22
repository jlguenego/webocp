<?php
	class OCP {
		public $name;
		public $url;
		public $sponsor;
		public $start_address = null;
		public $contact_list = null;
		public $quota = 0;
		public $location = array();

		public static function get_name_from_url($url) {
			$name = preg_replace('#.*webocp/server/(.+)/endpoint.*#', "$1", $url);
			return $name;
		}

		public function hydrate($array) {
			foreach ($array as $key => $value) {
			 	 $this->$key = $value;
			}
		}

		public function generate_start_address() {
			$this->start_address = sha1($this->name);//sha1(rand(0, 1000000));
		}

		public function get_file() {
			return ROOT . '/conf/' . $this->name . '.json';
		}

		public function load($name) {
			$this->name = $name;
			$file = $this->get_file($this->name);
			debug('file2=' . $file);
			if (!is_file($file)) {
				throw new Exception('File not found: ' . $file);
			}
			$content = file_get_contents($file);
			$object = json_decode($content);
			$this->hydrate($object);
		}

		public function get_json() {
			$conf = array(
				"name" => $this->name,
				"url" => $this->url,
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
				"start_address" => $this->start_address,
				"quota" => $this->quota,
				"location" => $this->location,
			);
		}

		public function store() {
			mkdir_p(dirname($this->get_file($this->name)));
			file_put_contents($this->get_file($this->name), $this->get_json());
	    }

	    public function inform_sponsor() {
			$postdata = http_build_query(array('contact' => json_encode($this->to_contact())));

			$opts = array(
				'http' => array(
					'method' => "POST",
					'content' => $postdata
				)
			);
			$context = stream_context_create($opts);

			$response = file_get_contents($this->sponsor . '/endpoint/inform_sponsor.php', false, $context);
			debug_r('Response', $response);
			$response = json_decode($response);
			if (isset($response->error)) {
				throw new Exception($response->error);
			}
			$this->contact_list = $response->result->contact_list;
			debug_r('Contact_list', $this->contact_list);
	    }

	    public function inform_all($new_contact) {
			$postdata = http_build_query(array('contact' => json_encode($new_contact)));

			$opts = array(
				'http' => array(
					'method' => "POST",
					'content' => $postdata
				)
			);
			$context = stream_context_create($opts);
			foreach ($this->contact_list as $name => $contact) {
				if ($name == $new_contact->name) {
					continue;
				}
				$response = file_get_contents($contact->url . '/endpoint/add_contact.php', false, $context);
			}
	    }

	    public function get_mem_report() {
	    	$array = array(
	    		'total' => $this->quota * 1000 * 1000 * 1000,
	    		'used' => $this->get_used_mem(),
	    		'free_space' => @disk_free_space(storage_get_root()),
	    		'disk_space' => @disk_total_space(storage_get_root()),
	    		'used_space' => @disk_total_space(storage_get_root()) - @disk_free_space(storage_get_root()),
	    	);
			return $array;
	    }

	    public function get_used_mem() {
	    	$result = 0;
			$result = $this->foldersize(storage_get_root());
	    	return $result;
	    }

	    function foldersize($path) {
		    $total_size = 0;
		    if (!file_exists($path)) {
		    	return $total_size;
		    }
		    $files = scandir($path);
		    $cleanPath = rtrim($path, '/'). '/';

		    foreach($files as $t) {
		        if ($t<>"." && $t<>"..") {
		            $currentFile = $cleanPath . $t;
		            if (is_dir($currentFile)) {
		                $size = foldersize($currentFile);
		                $total_size += $size;
		            }
		            else {
		                $size = filesize($currentFile);
		                $relica = BLOCK_SIZE - ($size % BLOCK_SIZE);
		                $total_size += $size + $relica;
		            }
		        }
		    }

		    return $total_size;
		}

		public function set_coord($coord) {
			$obj = json_decode($coord);
			debug_r('test', $obj->coordinate);
			$this->location = $obj->coordinate;
		}
	}
?>
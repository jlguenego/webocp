<?php
	class OCP {
		public $name;
		public $url;
		public $sponsor;
		public $start_address = null;
		public $contact_list = null;

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
			$this->start_address = sha1(rand(0, 1000000));
		}

		public function get_file() {
			return ROOT . '/conf/' . $this->name . '.json';
		}

		public function load($name) {
			$this->name = $name;
			$content = file_get_contents($this->get_file($this->name));
			$object = json_decode($content);
			$this->hydrate($object);
		}

		public function get_json() {
			$conf = array(
				"name" => $this->name,
				"url" => $this->url,
				"start_address" => $this->start_address,
				"contact_list" => $this->contact_list
			);
			return prettyPrint(json_encode($conf));
		}

		public function to_contact() {
			return array(
				"name" => $this->name,
				"url" => $this->url,
				"start_address" => $this->start_address
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
	}
?>
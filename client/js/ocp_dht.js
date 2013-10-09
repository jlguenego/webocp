(function(ocp, undefined) {
	ocp.dht = {};

	ocp.dht.ring = null;

	ocp.dht.find = function(address) {
		if (!ocp.dht.ring) {
			console.log('new ring');
			ocp.dht.ring = new ocp.dht.Ring();
		}
		var contact = ocp.dht.ring.find(address);
		return contact;
	};

	ocp.dht.Contact = function(args) {
		this.name = args.name;
		this.url = args.url;
		this.start_address = args.start_address;

		this.toString = function() {
			return	this.name + ' ' + this.url + ' ' + this.start_address;
		}
	};

	ocp.dht.Ring = function() {
		this.ring = {};
		this.address_list = [];
		var url = ocp.dht.get_endpoint_url(null, 'get_contact_list');
		var contact_list = ocp.client.command({}, url);

		for (var name in contact_list) {
			var contact = new ocp.dht.Contact(contact_list[name]);
			this.ring[contact.start_address] = contact;
			this.address_list.push(contact.start_address);
		}
		this.address_list.sort();

		this.find = function(address) {
			var list = this.address_list.slice(0);
			list.push(address);
			list.sort();
			var index = list.indexOf(address);
			if (index == 0) {
				index = this.address_list.length;
			}
			return this.ring[this.address_list[index - 1]];
		};

		this.toCanvas = function(canvas) {
			console.log('toCanvas');
			canvas.width = 400;
			canvas.height = 400;
			var ring_radius = 150;
			var node_radius = 10;

			var ring_x = canvas.width / 2;
			var ring_y = canvas.height / 2;

			var context = canvas.getContext("2d");
			context.beginPath();
			context.arc(ring_x, ring_y, ring_radius, 0, 2 * Math.PI); // (x, y, radius, start_angle, end_angle)
			context.stroke();

			var ocp_canvas = new ocp.canvas.Canvas();

			for (var i = 0; i < this.address_list.length; i++) {
				var address = this.address_list[i];
				var n = parseInt(address.substr(0, 4), 16) / 0xffff;
				var angle = -n * (2 * Math.PI);

				var node_x = ring_x + ring_radius * Math.cos(angle);
				var node_y = ring_y + ring_radius * Math.sin(angle);

				context.beginPath();
				context.arc(node_x, node_y, node_radius, 0, 2 * Math.PI); // (x, y, radius, start_angle, end_angle)
				context.fill();

				ocp_canvas.zone_list.push(new ocp.canvas.Zone({
					type: 'circle',
					center: {
						x: node_x,
						y: node_y,
					},
					radius: node_radius,
					data: {
						address: address
					}
				}, function(e) {
					console.log('address=' + this.space.data.address)
				}));
			}

			canvas.addEventListener('click', on_click, false);

			function on_click(e) {
				var rect = canvas.getBoundingClientRect()
				var p = {
					x: e.clientX - rect.left,
					y: e.clientY - rect.top
				};
				var zone_a = ocp_canvas.get_zones(p);
				console.log(zone_a);
				for (var i = 0; i < zone_a.length; i++) {
					var zone = zone_a[i];
					zone.onmouse(p);
				}
			}


		};
	};

	ocp.dht.get_address = function(ab) {
		return ocp.crypto.hash(ab);
	};

	ocp.dht.get_endpoint_url = function(contact, endpoint, url_query) {
		var sponsor_name = ocp.cfg.sponsor_name || 'node0';
		var url = ocp.cfg.server_base_url + '/webocp/server/' + sponsor_name;
		if (contact) {
			url = contact.url;
		}
		endpoint = endpoint || 'index';
		url_query = url_query || '';
		return url + '/endpoint/' + endpoint + '.php' + url_query;
	};
})(ocp);
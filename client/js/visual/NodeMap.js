(function(ocp, undefined) {
	ocp.visual = ocp.visual || {};

	ocp.visual.NodeMap = function() {
		var self = this;

		this.initPos = {
			lat: 48.84802369546353,
			lng: 2.639940083026886
		};

		this.onnodeclick = function() {};

		this.data = [];
		this.links = [];
		this.overlay = null;
		this.main_group = null;
		this.projection = null;

		var x_scale = function(d) {
			d = new google.maps.LatLng(d.location[1], d.location[0]);
			d = self.projection.fromLatLngToDivPixel(d);
			return d.x;
		};

		var y_scale = function(d) {
			d = new google.maps.LatLng(d.location[1], d.location[0]);
			d = self.projection.fromLatLngToDivPixel(d);
			return d.y;
		};

		var show_links = function(node) {
			console.log('mouseover on node');
			console.log(node);
			var dataset = [];
			for (var i = 0; i < node.incoming.length; i++) {
				var contact_node = node.incoming[i];
				dataset.push({
					source: node,
					target: contact_node
				});
			}

			update_links(dataset, 'incoming');

			dataset = [];
			for (var i = 0; i < node.outgoing.length; i++) {
				var contact_node = node.outgoing[i];
				dataset.push({
					source: node,
					target: contact_node
				});
			}
			update_links(dataset, 'outgoing');
		};

		var hide_links = function() {
			console.log('mouseout on node');
			update_links([]);
		};

		var update_links = function(dataset, type) {
			console.log(dataset);
			var selector = '.node_link';
			if (type) {
				selector = selector + ' .' + type;
			}
			var path = self.main_group.selectAll(selector).data(dataset);
			path.enter().append("line")

			path.attr("x1", function(d) { return x_scale(d.source); })
				.attr("y1", function(d) { return y_scale(d.source); })
				.attr("x2", function(d) { return x_scale(d.target); })
				.attr("y2", function(d) { return y_scale(d.target); });
			path.classed('node_link', true);
			if (type) {
				path.classed(type, true);
			}

			path.exit().remove();
		}

		this.generate_random_data = function() {
			this.data = [
			];
		};

		this.add_node = function(geoc) {
			var nbr = this.data.length;
			var node = {
				lng: geoc.mb,
				lat: geoc.lb,
				label: 'node ' + nbr,
				incoming: [],
				outgoing: []
			};
			this.data.push(node);
			this.update_links();
			this.repaint();
		};

		this.update_links = function() {
			// strategy : choose N existing nodes and link them to the
			// last one.
			var existing_nodes = this.data.slice(0);
			var last_node = existing_nodes.pop();
			var remaining = 5;
			while (existing_nodes.length > 0 && remaining > 0) {
				var index = Math.round(Math.random() * (existing_nodes.length - 1));
				var contact_node = existing_nodes.splice(index, 1)[0];
				var link = {
					target: last_node,
					source: contact_node
				};
				this.links.push(link);
				last_node.incoming.push(contact_node);
				contact_node.outgoing.push(last_node);
				remaining--;
			}

		};

		this.repaint = function() {
			this.overlay.draw();
		};

		this.draw = function(div_selector) {
			d3.select(div_selector).classed('ocp_node_map', true);

			var minZoomLevel = 2;

			// Create the Google Map…
			var map = new google.maps.Map(d3.select(div_selector).node(), {
				zoom: 8,
				center: new google.maps.LatLng(this.initPos.lat, this.initPos.lng),
				mapTypeId: google.maps.MapTypeId.ROADMAP
			});

			// Control the zoom limit
			google.maps.event.addListener(map, 'zoom_changed', function() {
				if (map.getZoom() < minZoomLevel) {
					map.setZoom(minZoomLevel);
				}
			});

			// Load the station data. When the data comes back, create an overlay.
			this.overlay = new google.maps.OverlayView();

			// Add the container when the overlay is added to the map.
			this.overlay.onAdd = function() {
				console.log(this.getPanes());
				console.log('height=' + d3.select(div_selector));
				console.log('height=' + $(div_selector).height());
				var svg = d3.select(this.getPanes().overlayMouseTarget).append('svg')
					.attr('height', $(div_selector).height())
					.attr('width', $(div_selector).width());

				self.main_group = svg.append('g');

				this.draw = function() {
					hide_links();
					self.projection = this.getProjection();
					var padding = 10;

					console.log(self.data);
					var node_dataset = self.data;
					console.log('node_dataset');
					console.log(node_dataset);

					var g = self.main_group.selectAll("g").data(node_dataset);
					var new_g = g.enter().append("g");

					var node = new_g.append("circle")
						.attr("r", 10)
						.attr("cx", 0)
						.attr("cy", 0)
						.classed('node', true);
					new_g.append("circle")
						.attr("r", 15)
						.attr("cx", 0)
						.attr("cy", 0)
						.classed('transparent_node', true);

					//node.on('mouseover', show_links);
					//node.on('mouseout', hide_links);

					node.on('click', function(node) {
						console.log('click');
						self.onnodeclick(node);
					});

					new_g.append("text")
						.attr("x", 15)
						.attr("y", 0)
						.attr("dy", ".31em")
						.text(function(d) { return d.name; });

					g.attr('transform', transform);

					g.exit().remove();

					var rect = self.main_group.node().getBBox();
					console.log(rect);

					svg.attr('width', rect.width)
						.attr('height', rect.height)
						.style('top', rect.y + 'px')
						.style('left', rect.x + 'px');

					self.main_group.attr('transform', 'translate(' + -rect.x + ', ' + -rect.y + ')');

					function transform(d) {
						console.log('transform');
						console.log(d);
						d = new google.maps.LatLng(d.location[1], d.location[0]);
						d = self.projection.fromLatLngToDivPixel(d);
						var x = d.x;
						var y = d.y;
						return 'translate(' + x + ', ' + y + ')';
					}

				};
			};
			// Bind our overlay to the map…
			this.overlay.setMap(map);
		};
	};
})(ocp);
(function(ocp, undefined) {
	ocp.ns = {};

	ocp.ns.NodeSupervision = function() {
		var self = this;

		this.sidebar = $("#node_supervision_page").ocp_splitpane_h({
			source: [
				{ width: 15, }
			]
		});

		this.node_map = new ocp.visual.NodeMap();
		this.node_map.draw('#ocp_ns_map');

		this.pie = new ocp.visual.Pie('#ocp_ns_pie');
		this.pie.use_title = true;

		$('#ocp_ns_sidebar').ocp_fix_variable_h({
			fix: $('#ocp_ns_toggle_bar'),
			variable: $('#ocp_ns_node_prop_content')
		});

		$('#ocp_ns_node_prop_content').ocp_fix_variable_v();
		$('#ocp_ns_content').ocp_fix_variable_v();

		$('#ocp_ns_refresh').click(function() {
			var url = ocp.cfg.server_base_url + '/webocp/server/node0';

			var url = ocp.dht.get_endpoint_url({url: url}, 'get_contact_list');
			var contact_list = ocp.client.command({}, url);
			console.log(contact_list);
			self.node_map.data = d3.values(contact_list);
			self.node_map.data = d3.values(contact_list).filter(function(d) {
				return d.location instanceof Array;
			});
			self.node_map.repaint();
		});

		this.node_map.onnodeclick = function(node) {
			self.display_node_properties(node);
			if ($('#ocp_ns_toggle_button').hasClass('ocp_ns_node_prop_minimized')) {
				$('#ocp_ns_toggle_button').click();
			}
			this.select_node(node);
			console.log(node);
		};

		$('#ocp_ns_toggle_button').addClass('ocp_ns_node_prop_minimized');
		var node_prop_width = 450;
		$('#ocp_ns_toggle_button').click(function() {
			var new_width = 0;
			if ($(this).hasClass('ocp_ns_node_prop_minimized')) { //Maximize
				new_width = node_prop_width;
				$(this).removeClass('ocp_ns_node_prop_minimized');
			} else { // Minimize
				node_prop_width = $('#ocp_ns_sidebar').outerWidth()
				new_width = $('#ocp_ns_toggle_bar').outerWidth();
				$(this).addClass('ocp_ns_node_prop_minimized');
			}
			var size = { left: new_width };
			$('#node_supervision_page').ocp_splitpane_h('resize', size);
		});

		this.before_display = function() {
		};

		this.after_display = function() {
		};

		this.display_node_properties = function(node) {
			console.log(node);
			var json = ocp.client.command({}, ocp.dht.get_endpoint_url(node, 'get_mem_report'));
			console.log(json);
			var used = json.used;
			var left = json.total - used;
			var data = [
				{"label": "used", "value": used, title: 'Used: ' + ocp.utils.format_size(used)}
			];
			if (used < json.total) {
				data.push({"label": "free", "value": left, title: 'Free: ' + ocp.utils.format_size(left)});
			}
			this.pie.set(data);

			var node_prop = $('#ocp_ns_node_prop_content');
			node_prop.find('.name').html(node.name);
			node_prop.find('.start_address').html(node.start_address);
			var url = ocp.dht.get_contact_url(node);
			node_prop.find('.url').html('<a href="' + url + '/" target="_blank">' + url + '/</a>');

			var options = { output_format: 'object' };
			var used_o = ocp.utils.format_size(used, options);
			node_prop.find('.used .amount').html(ocp.utils.format_nbr(used_o.amount, 2));
			node_prop.find('.used .unit').html(used_o.unit);

			var free_o = ocp.utils.format_size(left, options);
			node_prop.find('.free .amount').html(ocp.utils.format_nbr(free_o.amount, 2));
			node_prop.find('.free .unit').html(free_o.unit);

			var total_o = ocp.utils.format_size(node.quota * 1000 * 1000 * 1000, options);
			node_prop.find('.total .amount').html(ocp.utils.format_nbr(total_o.amount, 2));
			node_prop.find('.total .unit').html(total_o.unit);
		}
	};


})(ocp);
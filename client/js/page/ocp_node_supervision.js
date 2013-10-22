(function(ocp, undefined) {
	ocp.ns = {};



	$(document).ready(function() {
		$("#node_supervision_page").ocp_splitpane_h({
			source: [
				{ width: 450, }
			]
		});

		$('#ocp_ns_node_prop_content').ocp_fix_variable_v();
		$('#ocp_ns_map_view').ocp_fix_variable_v();

		var node_map = new ocp.visual.NodeMap();
		node_map.draw('#ocp_ns_map');

		var pie = new ocp.visual.Pie('#ocp_ns_pie');
		pie.use_title = true;

		node_map.onnodeclick = function(node) {
			display_node_properties(node);
			console.log(node);
		};

//		display_node_properties({
//			url: 'http://localhost/webocp/server/node0',
//			name: 'node9',
//			start_address: '0785284586ef5810b80560319ef24968e897f7ce',
//			quota: 1,
//		});

		function display_node_properties(node) {
			var json = ocp.client.command({}, node.url + '/endpoint/get_mem_report.php');
			console.log(json);
			var used = json.used;
			var left = json.total - used;
			var data = [
				{"label": "used", "value": used, title: 'Used: ' + ocp.utils.format_size(used)}
			];
			if (used < json.total) {
				data.push({"label": "free", "value": left, title: 'Free: ' + ocp.utils.format_size(left)});
			}
			pie.set(data);

			var node_prop = $('#ocp_ns_node_prop');
			node_prop.find('.name').html(node.name);
			node_prop.find('.start_address').html(node.start_address);
			node_prop.find('.url').html(node.url);

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

		var loaded = false;

		$('#ocp_ns_refresh').click(function() {
			var url = ocp.cfg.server_base_url + '/webocp/server/node0';

			var url = ocp.dht.get_endpoint_url({url: url}, 'get_contact_list');
			var contact_list = ocp.client.command({}, url);
			console.log(contact_list);
			node_map.data = d3.values(contact_list);
			node_map.data = d3.values(contact_list).filter(function(d) {
				return d.location instanceof Array;
			});
			if (loaded) {
				node_map.repaint();
			}
			if (node_map.data.length > 0 && $('#ocp_ns_node_prop .name').val() == '') {
				display_node_properties(node_map.data[0]);
			}
		});

		$(window).load(function() {
			$('#ocp_ns_refresh').click();
			loaded = true;
			node_map.repaint();
		});

		$('#ocp_ns_node_prop').ocp_fix_variable_h();

		var node_prop_width = 150;
		$('#ocp_ns_toggle_prop').click(function() {
			var new_width = 0;
			if ($(this).hasClass('ocp_ns_node_prop_maximize')) { //Maximize
				new_width = footer_restore_height;
				$(this).removeClass('ocp_ns_node_prop_maximize');
			} else { // Minimize
				footer_restore_height = $('#ocp_ns_node_prop').outerWidth()
				new_width = $('#ocp_ns_toggle_prop').outerWidth();
				$(this).addClass('ocp_ns_node_prop_maximize');
			}
			var size = { left: new_width };
			$('#node_supervision_page').ocp_splitpane_h('resize', size);
		});
	});
})(ocp);
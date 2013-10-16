(function(ocp, undefined) {
	ocp.am = {};

	ocp.am.sidebar = function() {
		$('#ocp_am_sidebar a').each(function() {
			$(this).html('<div class="ocp_am_link_button">' + $(this).html() + '</div>');
		});
	};

	var first_time = true;
	ocp.am.show_page = function() {
		$('#account_management_page').show();

		if (!first_time) {
			return;
		}
		first_time = false;
		console.log('execute ocp.am.show_page');
		ocp.am.sidebar();


		$('#ocp_am_page').ocp_fix_variable({
			fix: $('#ocp_am_page .ocp_footer'),
			variable: $('#ocp_am_main') });
		$('#ocp_am_main').ocp_fix_variable();
		$('#ocp_am_body').ocp_text_value();

		$('.ocp_am_section').hide();
		$('#ocp_am_details_button').addClass('selected');

		// Section definition
		$('#ocp_am_quota').ocp_quota({ quota: 50 });
		$('#ocp_am_quota').ocp_quota('update', 10);

		// Quota prevision
		function build_dataset(start_t, end_t) {
			var days_nbr = Math.floor((end_t - start_t) / 86400);
			var quota = Math.floor((Math.random() * 100) + 1);

			var dataset = [];
			for (var i = 0; i < days_nbr; i++) {
				if (i % Math.round((Math.random() * 300) + 150) == 0) {
					quota -= Math.random() * 5;
				}
				if (quota < 0) {
					quota = 0;
				}
				dataset.push({
					timestamp: start_t + i * 86400,
					quota: quota
				});
			}

			return dataset;
		}

		var margin = { top: 20, right: 5, bottom: 20, left: 50 };

		var today = new Date();
		today.setHours(0, 0, 0, 0);
		var start_t = Math.floor(today.getTime() / 1000);
		var end_t = start_t + 365 * 2 * 86400;

		var dataset = build_dataset(start_t, end_t);

		var avg = d3.mean(dataset, function(d) { return d.quota; })

		var dataset2 = dataset.map(function(d) {
			return {
				timestamp: d.timestamp,
				used_mem: avg
			};
		});

		var graph = new ocp.graphic.Graph('#ocp_am_quota_chart', margin);

		graph.start_t = start_t;
		graph.end_t = end_t;
		graph.x_access = function(d) { return d.timestamp; };

		graph.dataset = dataset;
		graph.y_access = function(d) { return d.quota; };
		graph.scale_y(0.1, 0.1);

		graph.y_format = function(n) { return d3.format(".2f")(n) + ' TB'; };

		graph.draw_axis();
		graph.interpolate = 'step';
		graph.add_legend('Quota');
		graph.draw_line();


		graph.dataset = dataset2;
		graph.y_access = function(d) { return d.used_mem; };
		graph.color = 'red';
		graph.add_legend('Used storage');
		graph.draw_line();

		$(window).load(function() {
			graph.draw_legend();
		});
	};
})(ocp);
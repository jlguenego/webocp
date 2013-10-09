(function(ocp, undefined) {
	ocp.graphic = {};

	// Draw a tooltip
	function tooltip(g, msg, x, y, margin) {
		margin = margin || {top: 0, right: 3, bottom: 0, left: 3};
		g.classed('tooltip', true);

		var rect = g.append('rect')


		var text = g.append('text')
			.text(msg)
			.classed('label', true);
		text.attr('x', x + margin.left)
			.attr('y', y + margin.bottom);

		var r = text.node().getBBox();

		rect.attr('x', 	r.x - margin.left)
			.attr('y', r.y - margin.bottom)
			.attr('width', r.width + margin.left + margin.right)
			.attr('height', r.height + margin.top + margin.bottom);
	}

	// Return transaction between two timestamps
	function filter_transaction(dataset, start_t, end_t) {
		var result = [];
		for (var i = 0; i < dataset.length; i++) {
			var data = dataset[i];
			if (data.timestamp >= start_t && data.timestamp <= end_t) {
				result.push(data);
			}
		}
		return result;
	}

	ocp.graphic.group_transaction = function(dataset, group_size) {
		group_size = group_size || 3
		var result = [dataset[0]];
		var group = [];

		for (var i = 0; i < dataset.length; i++) {
			group.push(dataset[i]);

			if (group.length < group_size && i < dataset.length - 1) {
				continue;
			}
			var transaction = {
				timestamp: group[group.length - 1].timestamp,
				rate: ocp.math.mean(group, 'rate', 'quantity'),
				quantity: 1
			};
			group = [];
			result.push(transaction);
		}
		return result;
	}

	// Get lablel from transaction
	function label(transaction, time_format, eur_format) {
		return time_format(new Date(transaction.timestamp * 1000)) + ' ' + eur_format(transaction.rate);
	}

	function translate(scales) {
		return function(d) {
			return 'translate(' + scales.x(new Date(d.timestamp * 1000))
				+ ', ' + scales.y(d.rate) + ')';
		}
	}

	function scatter_plot(svg, scales, dataset, time_format, eur_format) {
		console.log(dataset);
		var point = svg.selectAll('.point').data(dataset);
		point.enter()
			.append('g')
				.attr('transform', translate(scales))
				.classed('point', true);

		point.append('circle')
				.attr('r', 2.5)
				.attr('cx', 1)
				.attr('cy', 1)
				.classed('shadow', true);

		point.append('circle')
				.attr('r', 2.5)
				.classed('circle', true);

		point
			.attr('cx', function(d) { return scales.x(new Date(d.timestamp * 1000)); })
			.attr('cy', function(d) { return scales.y(d.rate); });

		point.exit().remove();

		// Draw tooltip when mouse on point
		point.on('mouseover', function(e) {
			var mouse = d3.mouse(svg.node());

			var p = d3.select(this);
			var transaction = p.datum();
			var info_dataset = [ transaction ];
			var info = svg.selectAll('.tooltip').data(info_dataset);
			info.enter().append('g');

			var msg = label(transaction, time_format, eur_format);

			tooltip(info, msg, mouse[0] + 5, mouse[1] - 5);

			info.exit().remove();
		});

		point.on('mouseout', function(e) {
			var info = svg.selectAll('.tooltip').data([]);
			info.exit().remove();
		});
	};

	// Draw a curve
	function curve(svg, scales, dataset, color, interpolate) {
		interpolate = interpolate || "basis";
		var lineFunction = d3.svg.line()
			.x(function(d) { return scales.x(new Date(d.timestamp * 1000)); })
			.y(function(d) { return scales.y(d.rate); })
			.interpolate(interpolate);

		var lineGraph = svg.append("path")
			.attr("d", lineFunction(dataset))
			.attr("stroke", color)
			.attr("stroke-width", 2)
			.attr("fill", "none");
	};

	ocp.graphic.draw_graph = function(svg_elem, transaction_obj, start_t, end_t, margin) {
		margin = margin || { top: 50, right: 50, bottom: 50, left: 50 };
		var svg = d3.select(svg_elem);

		var transaction_list = transaction_obj.transaction_list;
		var point_dataset = filter_transaction(transaction_list, start_t, end_t);

		var y_a = point_dataset.map(function(d) { return d.rate; });
		var y_max = d3.max(y_a) + 0.1 * (d3.max(y_a) - d3.min(y_a));
		var y_min = d3.min(y_a) - 0.1 * (d3.max(y_a) - d3.min(y_a));

		var time_format = d3.time.format("%d.%m");

		if (end_t - start_t > 90 * 86400) {
			time_format = d3.time.format("%b");
		}

		var width = svg.attr('width') - margin.left - margin.right;
		var height = svg.attr('height') - margin.top - margin.bottom;

		// Draw white rectangle
		svg.append('rect')
			.attr('x', margin.left)
			.attr('y', margin.top)
			.attr('width', width)
			.attr('height', height)
			.classed('graph_area', true);

		// Define scales and axis
		var x_scale = d3.time.scale()
			.domain([ new Date(start_t * 1000), new Date(end_t * 1000) ])
			.range([margin.left, margin.left + width ]);
		var x_axis = d3.svg.axis()
			.scale(x_scale)
			.orient("bottom")
			.tickSize(height)
			.tickFormat(time_format);

		if (end_t - start_t > 90 * 86400) {
			x_axis.ticks(d3.time.month, 1);
		} else {
			x_axis.ticks(d3.time.day, 2);
		}

		var y_scale = d3.scale.linear()
			.domain([ y_max, y_min ])
			.range([ margin.top, margin.top + height ]);
		var eur_format = function(n) { return d3.format(".2f")(n) + ' €'; };
		var y_axis = d3.svg.axis()
			.scale(y_scale)
			.orient("left")
			.tickSize(width)
			.ticks(5)
			.tickFormat(eur_format);

		// Draw axis
		svg.append("g")
			.classed('axis', true)
			.attr("transform", 'translate(0, ' + (margin.top) + ')')
			.call(x_axis);

		svg.append("g")
			.classed('axis', true)
			.attr("transform", 'translate(' + (margin.left + width) + ', 0)')
			.call(y_axis);

		var scales = {
			x: x_scale,
			y: y_scale
		};

		curve(svg, scales, point_dataset, 'blue', 'linear');
		scatter_plot(svg, scales, point_dataset, time_format, eur_format);
	};

	ocp.graphic.draw_chart = function(svg_elem, transaction_obj, margin) {
		margin = margin || { top: 50, right: 50, bottom: 50, left: 50 };

		var start_t = transaction_obj.query.end_t - 86400;
		var end_t = transaction_obj.query.end_t;
		var transaction_list = transaction_obj.transaction_list;

		// Make rate average each {seconds}
		function make_average(dataset, seconds) {
			var result = [];
			var sampling_nbr = 50;

			for (var i = 0; i <= sampling_nbr; i++) {
				var timestamp = start_t + i * (end_t - start_t) / sampling_nbr;
				var samples = filter_transaction(dataset, timestamp - seconds, timestamp);
				var avg = ocp.math.mean(samples, 'rate', 'quantity');

				result.push({
					timestamp: timestamp,
					rate: avg
				});
			}
			return result;
		}

		var svg = d3.select(svg_elem);
		var point_dataset = filter_transaction(transaction_list, start_t, end_t);


		// Calculate min and max scale
		var y_a = transaction_list.map(function(d) { return d.rate; });
		var y_max = d3.max(y_a) + 1;
		var y_min = d3.min(y_a) - 4;

		var width = svg.attr('width') - margin.left - margin.right;
		var height = svg.attr('height') - margin.top - margin.bottom;

		// Draw white rectangle
		svg.append('rect')
			.attr('x', margin.left)
			.attr('y', margin.top)
			.attr('width', width)
			.attr('height', height)
			.classed('graph_area', true);

		// Draw scales
		var x_scale = d3.time.scale()
			.domain([ new Date(start_t * 1000), new Date(end_t * 1000) ])
			.range([margin.left, margin.left + width ]);
		var time_format = d3.time.format("%H:%M");
		var x_axis = d3.svg.axis()
			.scale(x_scale)
			.orient("bottom")
			.tickSize(height)
			.ticks(d3.time.hour, 3)
			.tickFormat(time_format);

		var y_scale = d3.scale.linear()
			.domain([ y_max, y_min ])
			.range([ margin.top, margin.top + height ]);
		var eur_format = function(n) { return d3.format(".2f")(n) + ' €'; };
		var y_axis = d3.svg.axis()
			.scale(y_scale)
			.orient("left")
			.tickSize(width)
			.ticks(5)
			.tickFormat(eur_format);

		svg.append("g")
			.classed('axis', true)
			.attr("transform", 'translate(0, ' + (margin.top) + ')')
			.call(x_axis);

		svg.append("g")
			.classed('axis', true)
			.attr("transform", 'translate(' + (margin.left + width) + ', 0)')
			.call(y_axis);

		var scales = {
			x: x_scale,
			y: y_scale
		};

		scatter_plot(svg, scales, point_dataset, time_format, eur_format);

		// Start drawing the average curve
		point_dataset = make_average(transaction_list, 3 * 3600);
		curve(svg, scales, point_dataset, 'blue');
		point_dataset = make_average(transaction_list, 12 * 3600);
		curve(svg, scales, point_dataset, 'red');
	};
})(ocp)
(function(ocp, undefined) {
	ocp.graphic = {};

	ocp.graphic.draw_chart = function(svg_elem, transaction_obj) {
		var start_t = transaction_obj.query.end_t - 86400;
		var end_t = transaction_obj.query.end_t;
		var transaction_list = transaction_obj.transaction_list;


		// Return transaction between two timestamps
		function filter_transaction(dataset, start_t, end_t) {
			var result = [];
			for (var i = 0; i < dataset.length; i++) {
				var data = dataset[i];
				if (data.timestamp > start_t && data.timestamp < end_t) {
					result.push(data);
				}
			}
			return result;
		}

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

		// Draw a curve
		function plot(dataset, color) {
			var lineFunction = d3.svg.line()
				.x(function(d) { return x_scale(new Date(d.timestamp * 1000)); })
				.y(function(d) { return y_scale(d.rate); })
				.interpolate("basis");

			var lineGraph = svg.append("path")
				.attr("d", lineFunction(dataset))
				.attr("stroke", color)
				.attr("stroke-width", 2)
				.attr("fill", "none");
		}

		function translate(d) {
			return 'translate(' + x_scale(new Date(d.timestamp * 1000))
				+ ', ' + y_scale(d.rate) + ')';
		}

		// Get lablel from transaction
		function label(d) {
			return time_format(new Date(d.timestamp * 1000)) + ' ' + eur_format(d.rate);
		}

		var svg = d3.select(svg_elem);
		var point_dataset = filter_transaction(transaction_list, start_t, end_t);

		// Calculate min and max scale
		var y_a = transaction_list.map(function(d) { return d.rate; });
		var y_max = y_a.max() + 1;
		var y_min = y_a.min() - 1;

		var margin = { top: 50, right: 50, bottom: 50, left: 50 };
		var width = svg.attr('width') - margin.left - margin.right;
		var height = svg.attr('height') - margin.top - margin.bottom;

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

		// Draw points
		var point = svg.selectAll('.point').data(point_dataset);
		point.enter()
			.append('g')
				.attr('transform', translate)
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
			.attr('cx', function(d) { return x_scale(new Date(d.timestamp * 1000)); })
			.attr('cy', function(d) { return y_scale(d.rate); });

		point.exit().remove();

		// Draw tooltip when mouse on point
		point.on('mouseover', function(e) {
			var mouse = d3.mouse(svg.node());

			var p = d3.select(this);
			var transaction = p.datum();
			var info_dataset = [ transaction ];
			var info = svg.selectAll('.tooltip').data(info_dataset);
			info.enter().append('g');

			var msg = label(transaction);

			tooltip(info, msg, mouse[0] + 5, mouse[1] - 5);

			info.exit().remove();
		});

		point.on('mouseout', function(e) {
			var info = svg.selectAll('.tooltip').data([]);
			info.exit().remove();
		});


		// Start drawing the average curve
		point_dataset = make_average(transaction_list, 3 * 3600);
		plot(point_dataset, 'blue');
		point_dataset = make_average(transaction_list, 12 * 3600);
		plot(point_dataset, 'red');
	};
})(ocp)
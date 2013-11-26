(function(ocp, undefined) {
	ocp.chart = {};

	ocp.chart.Graph = function(graph_selector, margin) {

		this.init = function() {
			var svg_elem = $(graph_selector).find('svg').get(0);
			console.log('graph_selector=' + graph_selector);
			this.svg = d3.select(svg_elem);

			var width = this.svg.attr('width');
			var height = this.svg.attr('height');
			var container = $(this.svg.node()).parent().html('');

			this.svg = d3.select(graph_selector).append('svg')
				.attr('width', width)
				.attr('height', height);

			$(this.svg.node()).parent().addClass('ocp_graphic');

			this.width = this.svg.attr('width') - this.margin.left - this.margin.right;
			this.height = this.svg.attr('height') - this.margin.top - this.margin.bottom;

			this.legend = [];
		};

		this.margin = margin;
		this.svg = null;

		this.start_t = null;
		this.end_t = null;

		this.y_min = null;
		this.y_max = null;

		this.time_format = null;
		this.y_format = null;

		this.x_access = null;
		this.y_access = null;

		this.x_scale = null;
		this.y_scale = null;

		this.dataset = null;
		this.interpolate = 'linear';
		this.color = 'blue';

		this.legend = [];
		this.legend_css = null;

		this.init();

		this.scale_y = function(margin_top, margin_bottom) {
			var y_a = this.dataset.map(this.y_access);
			var amplitude = d3.max(y_a) - d3.min(y_a) + 1;
			this.y_max = Math.max(d3.max(y_a) + margin_top * amplitude, this.y_max);
			if (this.y_min) {
				this.y_min = Math.min(d3.min(y_a) - margin_bottom * amplitude, this.y_min);
			} else {
				this.y_min = d3.min(y_a) - margin_bottom * amplitude;
			}
		}

		this.draw_axis = function() {
			// Draw white rectangle
			this.svg.append('rect')
				.attr('x', this.margin.left)
				.attr('y', this.margin.top)
				.attr('width', this.width)
				.attr('height', this.height)
				.classed('graph_area', true);

			var interval = this.end_t - this.start_t;

			if (interval > 365 * 86400) {
				this.time_format = d3.time.format("%b %y");
			} else if (interval > 90 * 86400) {
				this.time_format = d3.time.format("%b");
			} else if (interval > 48 * 3600) {
				this.time_format = d3.time.format("%d.%m");
			} else {
				this.time_format = d3.time.format("%H:%M");
			}

			// Define scales and axis
			this.x_scale = d3.time.scale()
				.domain([ new Date(this.start_t * 1000), new Date(this.end_t * 1000) ])
				.range([this.margin.left, this.margin.left + this.width ]);
			var x_axis = d3.svg.axis()
				.scale(this.x_scale)
				.orient("bottom")
				.tickSize(this.height)
				.tickFormat(this.time_format);

			if (this.tick_period) {
				x_axis.ticks(this.tick_period, this.tick_period_value);
			}

			this.y_scale = d3.scale.linear()
				.domain([ this.y_max, this.y_min ])
				.range([ this.margin.top, this.margin.top + this.height ]);
			var y_axis = d3.svg.axis()
				.scale(this.y_scale)
				.orient("left")
				.tickSize(this.width)
				.ticks(5)
				.tickFormat(this.y_format);

			// Draw axis
			this.svg.append("g")
				.classed('axis', true)
				.attr("transform", 'translate(0, ' + (this.margin.top) + ')')
				.call(x_axis);

			this.svg.append("g")
				.classed('axis', true)
				.attr("transform", 'translate(' + (this.margin.left + this.width) + ', 0)')
				.call(y_axis);
		};

		this.draw_line = function() {
			var self = this;

			var lineFunction = d3.svg.line()
				.x(function(d) { return self.x_scale(new Date(self.x_access(d) * 1000)); })
				.y(function(d) { return self.y_scale(self.y_access(d)); })
				.interpolate(this.interpolate);

			this.svg.append("path")
				.attr("d", lineFunction(this.dataset))
				.attr("stroke", this.color)
				.attr("stroke-width", 2)
				.attr("fill", "none");
		};

		this.translate = function() {
			var self = this;
			return function(d) {
				return 'translate(' + self.x_scale(new Date(self.x_access(d) * 1000))
					+ ', ' + self.y_scale(self.y_access(d)) + ')';
			}
		}

		// Draw a tooltip
		this.tooltip = function(g, msg, x, y, margin) {
			margin = margin || {top: 0, right: 3, bottom: 0, left: 3};
			g.classed('tooltip', true);

			var rect = g.append('rect');

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
		};

		this.label = function(d) {
			return this.time_format(new Date(this.x_access(d) * 1000)) + ' ' + this.y_format(this.y_access(d));
		};

		this.draw_scatter_plot = function() {
			var self = this;

			var point = this.svg.selectAll('.point').data(this.dataset);
			point.enter()
				.append('g')
					.attr('transform', this.translate())
					.classed('point', true);

			point.append('circle')
					.attr('r', 2.5)
					.attr('cx', 1)
					.attr('cy', 1)
					.classed('shadow', true);

			point.append('circle')
					.attr('r', 2.5)
					.classed('circle', true);

			point.exit().remove();

			// Draw tooltip when mouse on point
			point.on('mouseover', function(e) {
				var mouse = d3.mouse(self.svg.node());

				var p = d3.select(this);
				var transaction = p.datum();
				var info_dataset = [ transaction ];
				var info = self.svg.selectAll('.tooltip').data(info_dataset);
				info.enter().append('g');

				var msg = self.label(transaction);

				self.tooltip(info, msg, mouse[0] + 5, mouse[1] - 5);

				info.exit().remove();
			});

			point.on('mouseout', function(e) {
				var info = self.svg.selectAll('.tooltip').data([]);
				info.exit().remove();
			});
		};

		this.add_legend = function(msg) {
			this.legend.push({
				color: this.color,
				msg: msg
			});
		};

		this.draw_legend = function() {
			var svg = $(this.svg.node());
			var div = $('<div/>').insertAfter(svg).addClass('legend');
			var table = $('<table/>').appendTo(div);

			for (var i = 0; i < this.legend.length; i++) {
				var legend = this.legend[i];
				var tr = $('<tr/>').appendTo(table);
				var color = $('<td/>').appendTo(tr).addClass('legend_color_box');

				$('<div/>').appendTo(color).addClass('legend_color')
					.css({ 'background-color': legend.color, 'border-color': legend.color })
					.wrap('<div/>');

				var msg = $('<td/>').appendTo(tr).html(legend.msg);
			}

			console.log(this.margin);
			console.log(svg.width());
			console.log(div.outerWidth(true));

			if (!this.legend_css) {
				this.legend_css = {
					bottom: this.margin.bottom + 8,
					left: svg.width() - this.margin.right - div.outerWidth(true) - 4
				}
			}

			div.css(this.legend_css);
		};
	};

	// Return transaction between two timestamps
	ocp.chart.filter_transaction = function(dataset, start_t, end_t) {
		var result = [];
		for (var i = 0; i < dataset.length; i++) {
			var data = dataset[i];
			if (data.timestamp >= start_t && data.timestamp <= end_t) {
				result.push(data);
			}
		}
		return result;
	};

	ocp.chart.make_average = function(dataset, seconds, start_t, end_t) {
		var result = [];
		var sampling_nbr = 50;

		var interval = (end_t - start_t) / sampling_nbr;

		for (var i = 0; i <= sampling_nbr; i++) {
			var timestamp = start_t + i * interval;
			var samples = ocp.graphic.filter_transaction(dataset, timestamp - seconds, timestamp);
			var avg = ocp.math.mean(samples, 'rate', 'quantity');

			result.push({
				timestamp: timestamp,
				rate: avg
			});
		}
		return result;
	}

	ocp.chart.group_transaction = function(dataset, group_size) {
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
})(ocp)
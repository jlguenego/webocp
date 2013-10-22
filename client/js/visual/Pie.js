(function(ocp, undefined) {
	ocp.visual = ocp.visual || {};

	ocp.visual.Pie = function(selector) {
		this.pie = d3.select(selector);
		this.width = 200;
		this.height = 200;
		this.radius = 100;
		this.use_title = false;
		this.minimum = 2;

		this.svg = this.pie.append('svg')
			.attr("width", this.width)
			.attr("height", this.height);

		this.g = this.svg.append('g')
			.attr("transform", "translate(" + this.radius + "," + this.radius + ")")



		this.set = function(data) {
			var sum = d3.sum(data, function(d) { return d.value; })
			var self = this;
			var dataset = data.map(function(d) {
				var value = d.value * 100 / sum;
				if (value < 0) {
					value = 0;
				}
				if (value > 100) {
					value = 100;
				}
				if (value > 0 && value < 100) {
					value = Math.min(Math.max(value, self.minimum), 100 - self.minimum);
				}
				return {
					value: value,
					label: d.label,
					title: d.title
				};
			});

			dataset = dataset.filter(function(d) {
				return d.value > 0;
			});
			console.log('sum=' + sum);
			console.log(data);
			console.log(dataset);
			this.g.data([ dataset ]);
			var arc = d3.svg.arc().outerRadius(this.radius);
			var pie = d3.layout.pie().value(function(d) { return d.value; })
				.sort(function(a, b) { return d3.ascending(a.label, b.label); });
			var arcs = this.g.selectAll("g.slice").data(pie);

			// ENTER
			var g = arcs.enter()
				.append('g')
					.attr('class', 'slice');

			g.append("path");

			if (this.use_title) {
				g.select("path")
					.append('title')
			}

			g.append("text");

			// UPDATE
			arcs.select('path')
				.attr('class', function(d) {
					console.log(d);
					return d.data.label;
				})
				.classed('piece', true)
				.attr("d", arc);

			arcs.select('title').text(function(d) {
					return d.data.title;
				});

			var self = this;
			arcs.select("text")
				.attr("transform", function(d) {
					d.innerRadius = 0;
					d.outerRadius = self.radius;
					return "translate(" + arc.centroid(d) + ")";
				})
				.attr("text-anchor", "middle")
				.text(function(d, i) { return d.data.label; });

			// EXIT
			arcs.exit().remove();
		};
	};
})(ocp);
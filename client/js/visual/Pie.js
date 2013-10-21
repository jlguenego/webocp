(function(ocp, undefined) {
	ocp.visual.Pie = function(selector) {
		this.pie = d3.select(selector);
		this.width = 300;
		this.height = 300;
		this.radius = 100;

		this.svg = this.pie.append('svg')
			.attr("width", this.width)
			.attr("height", this.height);

		this.g = this.svg.append('g')
			.attr("transform", "translate(" + this.radius + "," + this.radius + ")")



		this.set = function(data) {
			this.g.data([ data ]);
			var arc = d3.svg.arc().outerRadius(this.radius);
			var pie = d3.layout.pie().value(function(d) { return d.value; })
				.sort(function(a, b) { return d3.ascending(a.label, b.label); });
			var arcs = this.g.selectAll("g.slice").data(pie);

			// ENTER
			var g = arcs.enter()
				.append('g')
					.attr('class', 'slice');

			g.append("path");
			g.append("text");

			// UPDATE
			arcs.select('path')
				.attr('class', function(d) {
					console.log(d);
					return d.data.label;
				})
				.attr("d", arc);

			var self = this;
			arcs.select("text")
				.attr("transform", function(d) {
					d.innerRadius = 0;
					d.outerRadius = self.radius;
					return "translate(" + arc.centroid(d) + ")";
				})
				.attr("text-anchor", "middle")
				.text(function(d, i) { return data[i].label; });

			// EXIT
			arcs.exit().remove();
		};
	};
})(ocp);
(function(ocp, undefined) {
	ocp.visual = ocp.visual || {};

	ocp.visual.Ring = function(selector) {
		this.ring = d3.select(selector);
		this.width = 450;
		this.height = 450;
		this.radius = 200;
		this.use_title = false;
		this.minimum = 2;

		this.ocp_ring = new ocp.dht.Ring();;

		this.svg = this.ring.append('svg')
			.attr("width", this.width)
			.attr("height", this.height);

		this.svg.append('circle')
			.attr('cx', this.width / 2)
			.attr('cy', this.height / 2)
			.attr('r', this.radius)
			.attr('class', 'ocp_ring');


		this.set = function(data) {
			var self = this;
			var dataset = data.map(function(d) {
				console.log('d=' + d);
				var value = (parseInt(d.substr(0, 4), 16) / 0xffff) * 2 * Math.PI;
				console.log('value=' + value);
				return {
					value: value,
					addr: d
				};
			});

			dataset = dataset.filter(function(d) {
				return d.value > 0;
			});
//			console.log(data);
//			console.log(dataset);

			var point = this.svg.selectAll('.point').data(dataset);
			point.enter()
				.append('g')
					.attr('transform', this.translate())
					.attr('data-addr', function(d) { return d.addr; })
					.classed('ocp_node', true);

			point.append('circle')
					.attr('r', 10)
					.classed('circle', true);

			point.exit().remove();

			point.on('mouseover', function(e) {
				d3.select(this).classed('hover', true);
			});

			point.on('mouseout', function(e) {
				d3.select(this).classed('hover', false);
			});

			point.on('click', function(e) {
				console.log(d3.select(this));
				var addr = d3.select(this).attr('data-addr');

				console.log('addr=' + addr);
				var node = self.ocp_ring.ring[addr];
				var url = ocp.dht.get_contact_url(node);
				var win = window.open(url + '/', '_blank');
 				win.focus();
			});

		};

		this.translate = function() {
			var self = this;
			return function(d) {
				console.log(d);
				var x = (self.width / 2) + self.radius * Math.cos(d.value);
				var y = (self.height / 2) - self.radius * Math.sin(d.value);
				return 'translate(' + x + ', ' + y + ')';
			}
		}
	};
})(ocp);
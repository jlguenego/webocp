/*!
 * jQuery UI Header Content
 *
 *
 * Depends:
 *   jquery.ui.core.js
 *   jquery.ui.widget.js
 */


(function( $, undefined ) {

$.widget( "ui.ocp_quota", {
	version: "0.0.1",
	options: {
		quota: 50,
		used_mem: 0,
		unit: 'TB'
	},

	percent: 0,
	svg: null,
	percent_txt: null,
	g: null,
	line: null,

	from_block: null,
	to_block: null,
	progressbar: null,

	_create: function() {
		this.element.addClass('widget_quota_container');

		this.draw_ring();
		this.draw_bar();

		this.update(this.options.used_mem);

		return this;
	},
	draw_bar: function() {
		var right_block = $('<div/>').appendTo(this.element).addClass('right_block');

		this.from_block = $('<div/>').appendTo(right_block).addClass('from_block')
			.append('<span class="txt1">0</span>')
			.append('<span class="txt2">GB</span>');

		$('<div>of</div>').appendTo(right_block).addClass('of_block');

		this.to_block = $('<div/>').appendTo(right_block).addClass('to_block')
			.append('<span class="txt1">0</span>')
			.append('<span class="txt2">GB</span>');

		var progressbar = $('<div/>').appendTo(right_block).addClass('progressbar');
		var progressbar_bg = $('<div/>').appendTo(progressbar).addClass('progressbar_bg');
		this.progressbar = $('<div/>').appendTo(progressbar_bg).addClass('progress').width(0);
	},

	draw_ring: function() {
		var width = 200;
		var height = 200;

		this.svg = d3.select(this.element[0]).append('svg')
			.attr('width', width)
			.attr('height', height);

		this.g = this.svg.append("g")
			.attr('transform', 'translate(100,100)');

		var arc = d3.svg.arc()
			.innerRadius(80)
			.outerRadius(90)
			.startAngle(0)
			.endAngle(2 * Math.PI);

		this.g.append('path')
			.attr('d', arc)
			.classed('gray_circle', true);
		this.g.append('circle')
			.attr('r', 80)
			.classed('white_circle', true);
		this.g.append('circle')
			.attr('r', 60)
			.classed('black_circle', true);
		this.percent_txt = this.g.append('text')
			.attr('x', 0)
			.attr('y', -5)
			.classed('white_percent', true);
		this.g.append('text')
			.text('used')
			.attr('x', 0)
			.attr('y', 18)
			.classed('used', true);

		var angle = d3.scale.linear()
			.domain([0, 100])
			.range([0, 2 * Math.PI]);

		this.line = d3.svg.line.radial()
			.interpolate("basis")
			.tension(0)
			.radius(70)
			.angle(function(d, i) { return angle(i); });
	},

	update: function(used_mem) {
		this.options.used_mem = used_mem;
		this.percent = Math.round((this.options.used_mem / this.options.quota) * 100);

		this.percent_txt.text(this.percent + '%');
		this.path = this.g.selectAll(".blue_arc").data([ d3.range(this.percent) ]);
		this.path.enter().append('path')
			.classed('blue_arc', true);
		this.path.attr("d", this.line);

		this.progressbar.css('width', this.percent + '%');
		this.from_block
			.find('.txt1')
				.html(this.options.used_mem)
				.parent()
			.find('.txt2')
				.html(this.options.unit);

		this.to_block
			.find('.txt1')
				.html(this.options.quota)
				.parent()
			.find('.txt2')
				.html(this.options.unit);
	},

	_destroy: function() {
	}
});

})( jQuery );
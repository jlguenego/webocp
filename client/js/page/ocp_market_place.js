(function(ocp, undefined) {
	var margin = { top: 20, right: 5, bottom: 20, left: 50 };

	ocp.mp = {};

	ocp.mp.get_health = function(health) {
		var health_names = ['very bad', 'bad', 'quite bad', 'almost bad', 'normal', 'almost good', 'quite good', 'good', 'very good', 'perfect'];
		if (health > health_names.length - 1) {
			health = health_names.length - 1;
		}
		return health_names[health];
	};

	ocp.mp.build_buy_offers_data = function(data_a, max) {
		max = max || data_a.length;
		var result = [];
		for (var i = 0; i < max; i++) {
			var data = data_a[i];
			result.push({
				amount: ocp.utils.format_size(data.amount) + ' (' + ocp.utils.format_size(data.min_amount) + ')',
				price: ocp.utils.curr(data.price) + '€',
				health: ocp.mp.get_health(data.health),
				info: data.country,
				buy: '<a href="">BUY</a>'
			});
		}
		return result;
	};

	ocp.mp.build_sell_offers_data = function(data_a, max) {
		max = max || data_a.length;
		var result = [];
		for (var i = 0; i < max; i++) {
			var data = data_a[i];
			result.push({
				amount: ocp.utils.format_size(data.amount) + ' (' + ocp.utils.format_size(data.min_amount) + ')',
				price: ocp.utils.curr(data.price) + '€',
				health: ocp.mp.get_health(data.health),
				info: data.country,
				buy: '<a href="">SELL</a>'
			});
		}
		return result;
	};

	ocp.mp.print_48h = function() {
		var now_t = (new Date()).getTime() / 1000;
		var data = {
			start_t: now_t - 2 * 86400,
			end_t: now_t
		};
		var result = ocp.client.command(data, ocp.cfg.server_base_url + '/webocp/server/test/endpoint/get_transactions.php');
		var svg_elem = $('#ocp_mp_svg').get(0);

		ocp.graphic.draw_chart(svg_elem, result, margin);
	};

	ocp.mp.print_1m = function() {
		var now = new Date();
		var start = new Date(now.getTime());
		start.setMonth(start.getMonth() - 1);
		start.setHours(0, 0, 0, 0);
		var start_t = start.getTime() / 1000;
		var end_t = now.setHours(0, 0, 0, 0) / 1000;

		ocp.mp.draw_graph(start_t, end_t, 1);
	};

	ocp.mp.print_6m = function() {
		var now = new Date();
		var start = new Date(now.getTime());
		start.setMonth(start.getMonth() - 6);
		start.setHours(0, 0, 0, 0);
		var start_t = start.getTime() / 1000;
		var end_t = now.setHours(0, 0, 0, 0) / 1000;

		ocp.mp.draw_graph(start_t, end_t, 4);
	};

	ocp.mp.print_1y = function() {
		var now = new Date();
		var start = new Date(now.getTime());
		start.setMonth(start.getMonth() - 12);
		start.setHours(0, 0, 0, 0);
		var start_t = start.getTime() / 1000;
		var end_t = now.setHours(0, 0, 0, 0) / 1000;

		ocp.mp.draw_graph(start_t, end_t, 10);
	};

	ocp.mp.draw_graph = function(start_t, end_t, group_size) {
		var data = {
			start_t: start_t,
			end_t: end_t
		};
		var result = ocp.client.command(data, ocp.cfg.server_base_url + '/webocp/server/test/endpoint/get_rate.php');
		var svg_elem = $('#ocp_mp_svg').get(0);
		result.transaction_list = ocp.graphic.group_transaction(result.transaction_list, group_size);
		ocp.graphic.draw_graph(svg_elem, result, start_t, end_t, margin);
	};

	ocp.mp.manage_legend = function() {
		var legend_on = $('#ocp_mp_48h').hasClass('active');
		if (!legend_on) {
			$('#ocp_mp_legend').hide();
			return;
		}
		$('#ocp_mp_legend').show();
		var svg_offset = $('svg').offset();
		console.log('height=' + $('#ocp_mp_legend').outerHeight(true));
		console.log('width=' + $('#ocp_mp_legend').outerWidth(true));
		var offset = {
			top: 0 + $('#ocp_mp_svg').attr('height') - $('#ocp_mp_legend').outerHeight(true) - margin.bottom - 1,
			left: 0 + $('#ocp_mp_svg').attr('width') - $('#ocp_mp_legend').outerWidth(true) - margin.right - 1
		};
		$('#ocp_mp_legend').css(offset);
	};

	ocp.mp.svg_clean = function() {
		$('#ocp_mp_svg').children().remove();
	}
})(ocp);

$(document).ready(function() {
	$('#ocp_mp_buy').ocp_header_content();
	$('#ocp_mp_sell').ocp_header_content();

	var column = {
		amount: {
			label: 'Amount (min.)',
			width: 120
		},
		price: {
			label: 'Price/GB',
			width: 85
		},
		health: {
			label: 'Health',
			width: 70
		},
		info: {
			label: 'addl. Info',
			width: 65
		},
		buy: {
			label: 'Buy',
			width: 26
		}
	};

	var buy_offers = ocp.client.command({}, ocp.cfg.server_base_url + '/webocp/server/test/endpoint/get_buy_offers.php');
	var buy_offers_data = ocp.mp.build_buy_offers_data(buy_offers, 7);

	$("#ocp_mp_buy").ocp_grid({
		id: 'ocp_mp_buy',
		column: column,
		data: buy_offers_data
	});

	var sell_offers = ocp.client.command({}, ocp.cfg.server_base_url + '/webocp/server/test/endpoint/get_sell_offers.php');
	var sell_offers_data = ocp.mp.build_sell_offers_data(sell_offers, 7);

	column.health.label = 'Min. health';

	$("#ocp_mp_sell").ocp_grid({
		id: 'ocp_mp_sell',
		column: column,
		data: sell_offers_data
	});

	$('#ocp_mp_buttons li').click(function() {
		console.log('click');
		$('#ocp_mp_buttons li.active').removeClass('active');
		$(this).addClass('active');
		ocp.mp.svg_clean();
		switch($(this).attr('id')) {
			case 'ocp_mp_48h':
				ocp.mp.print_48h();
				break;
			case 'ocp_mp_1m':
				ocp.mp.print_1m();
				break;
			case 'ocp_mp_6m':
				ocp.mp.print_6m();
				break;
			case 'ocp_mp_1y':
				ocp.mp.print_1y();
				break;
		}
		ocp.mp.manage_legend();
	});

	$('#ocp_mp_legend').ready(function() {
		$('#ocp_mp_48h').click();
	});
});
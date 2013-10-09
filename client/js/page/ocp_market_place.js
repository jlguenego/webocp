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

		var today = new Date();
		var tomorrow = new Date();
		tomorrow.setDate(today.getDate() + 1);
		tomorrow.setHours(0, 0, 0, 0);
		var midnight_t = tomorrow.getTime() / 1000;

		for (var i = 0; i < max; i++) {
			var data = data_a[i];
			console.log('end_t=' + data.end_t);
			console.log('midnight_t=' + midnight_t);
			var interval = (data.end_t - midnight_t) / (86400 * 365);
			console.log('interval=' + interval);
			var volume = interval * (data.size / 1000) * data.rate; // Year * GB * € /
			var size = data.size;
			if (size > 1000) {
				size = ocp.utils.format_nbr(size / 1000, 1) + ' TB';
			} else {
				size += ' GB';
			}
			var min_size = ocp.utils.format_nbr(data.min_size, 1);
			if (min_size > 1000) {
				min_size = ocp.utils.format_nbr(min_size / 1000, 1) + ' TB';
			} else {
				min_size += ' GB';
			}

			result.push({
				size: size + ' (' + min_size + ')',
				rate: ocp.utils.curr(data.rate) + '€',
				volume: ocp.utils.curr(volume) + '€',
				end: ocp.utils.format_date(data.end_t, '%Y-%m-%d'),
				speed: data.speed,
				location: data.location,
				buy: '<a href="">BUY</a>'
			});
		}
		return result;
	};

	ocp.mp.build_sell_offers_data = function(data_a, max) {
		max = max || data_a.length;
		var result = [];

		var today = new Date();
		var tomorrow = new Date();
		tomorrow.setDate(today.getDate() + 1);
		tomorrow.setHours(0, 0, 0, 0);
		var midnight_t = tomorrow.getTime() / 1000;

		for (var i = 0; i < max; i++) {
			var data = data_a[i];
			console.log('end_t=' + data.end_t);
			console.log('midnight_t=' + midnight_t);
			var interval = (data.end_t - midnight_t) / (86400 * 365);
			console.log('interval=' + interval);
			var volume = interval * (data.size / 1000) * data.rate; // Year * GB * € /
			var size = data.size;
			if (size > 1000) {
				size = ocp.utils.format_nbr(size / 1000, 1) + ' TB';
			} else {
				size += ' GB';
			}
			var min_size = ocp.utils.format_nbr(data.min_size, 1);
			if (min_size > 1000) {
				min_size = ocp.utils.format_nbr(min_size / 1000, 1) + ' TB';
			} else {
				min_size += ' GB';
			}

			result.push({
				size: size + ' (' + min_size + ')',
				rate: ocp.utils.curr(data.rate) + '€',
				volume: ocp.utils.curr(volume) + '€',
				end: ocp.utils.format_date(data.end_t, '%Y-%m-%d'),
				speed: data.speed,
				location: data.location,
				sell: '<a href="">SELL</a>'
			});
		}
		return result;
	};

	ocp.mp.print_48h = function(transaction_obj) {
		var now_t = (new Date()).getTime() / 1000;
		var data = {
			start_t: now_t - 2 * 86400,
			end_t: now_t
		};
		var svg_elem = $('#ocp_mp_svg').get(0);

		ocp.graphic.draw_chart(svg_elem, transaction_obj, margin);
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
		var result = ocp.client.command(data, ocp.dht.get_endpoint_url(null, 'get_rate'));
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
	};

	ocp.mp.show_page = function() {
		var transaction_obj = ocp.client.command({}, ocp.dht.get_endpoint_url(null, 'get_transactions'));

		var obj = ocp.client.command({}, ocp.dht.get_endpoint_url(null, 'get_current_rate'));
		var current_rate = obj.rate;
		console.log(current_rate);
		$('#ocp_mp_current_price .eur').html(ocp.utils.curr(current_rate) + '€');
		$('#ocp_mp_current_price .btc').html(ocp.utils.curr(ocp.utils.eur2btc(current_rate)) + 'BTC');

		var today = new Date(obj.timestamp * 1000);
		var day = today.getDate();
		var month = today.getMonth() + 1; // January is 0!`
		var year = today.getFullYear();
		var hours = today.getHours();
		var minutes = today.getMinutes();
		$('#ocp_mp_current_price .date').html(day + '/' + month + '/' + year + ' at ' + hours + ':' + minutes);

		$('#ocp_mp_buy').ocp_header_content();
		$('#ocp_mp_sell').ocp_header_content();

		var buy_offers = ocp.client.command({}, ocp.dht.get_endpoint_url(null, 'get_buy_offers'));
		var buy_offers_data = ocp.mp.build_buy_offers_data(buy_offers, 7);

		$("#ocp_mp_buy").ocp_grid({
			id: 'ocp_mp_buy',
			column: {
				size: {
					label: 'Size (min.)',
					width: 100
				},
				end: {
					label: 'Expires on',
					width: 60
				},
				rate: {
					label: 'OCP rate',
					width: 55
				},
				volume: {
					label: 'Volume',
					width: 45
				},
				speed: {
					label: 'Speed',
					width: 36
				},
				location: {
					label: 'Location',
					width: 60
				},
				buy: {
					label: 'Buy',
					width: 26
				}
			},
			data: buy_offers_data
		});

		var sell_offers = ocp.client.command({}, ocp.dht.get_endpoint_url(null, 'get_sell_offers'));
		var sell_offers_data = ocp.mp.build_sell_offers_data(sell_offers, 7);

		$("#ocp_mp_sell").ocp_grid({
			id: 'ocp_mp_sell',
			column: {
				size: {
					label: 'Size (min.)',
					width: 100
				},
				end: {
					label: 'Expires on',
					width: 60
				},
				rate: {
					label: 'OCP rate',
					width: 55
				},
				volume: {
					label: 'Volume',
					width: 45
				},
				speed: {
					label: 'Speed',
					width: 36
				},
				location: {
					label: 'Location',
					width: 60
				},
				sell: {
					label: 'Sell',
					width: 26
				}
			},
			data: sell_offers_data
		});

		var last_transactions = transaction_obj.transaction_list;
		last_transactions.sort(function(a, b) {
			return b.timestamp - a.timestamp;
		});
		var last_transactions_data = last_transactions.slice(0, 20);
		$('#ocp_mp_recap1').find('td').remove();
		$('#ocp_mp_recap2').find('td').remove();
		console.log(last_transactions_data);

		for (var i = 0; i < last_transactions_data.length; i++) {
			var data = last_transactions_data[i];
			var table_no = 1;
			if (i > 9) {
				table_no = 2;
			}
			var table = $('#ocp_mp_recap' + table_no);
			console.log(table);
			var tr = $('<tr/>').appendTo(table);

			$('<td>').appendTo(tr).html(ocp.utils.format_date(data.timestamp));
			$('<td>').appendTo(tr).html(data.rate);
			$('<td>').appendTo(tr).html(data.quantity.toFixed(2));
			$('<td>').appendTo(tr).html((data.rate * data.quantity).toFixed(2));
		}

		$('#ocp_mp_buttons li').click(function() {
			console.log('click');
			$('#ocp_mp_buttons li.active').removeClass('active');
			$(this).addClass('active');
			ocp.mp.svg_clean();
			switch($(this).attr('id')) {
				case 'ocp_mp_48h':
					ocp.mp.print_48h(transaction_obj);
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
	};
})(ocp);


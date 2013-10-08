function get_health(health) {
	var health_names = ['very bad', 'bad', 'quite bad', 'almost bad', 'normal', 'almost good', 'quite good', 'good', 'very good', 'perfect'];
	if (health > health_names.length - 1) {
		health = health_names.length - 1;
	}
	return health_names[health];
}

function build_buy_offers_data(data_a, max) {
	max = max || data_a.length;
	var result = [];
	for (var i = 0; i < max; i++) {
		var data = data_a[i];
		result.push({
			amount: ocp.utils.format_size(data.amount) + ' (' + ocp.utils.format_size(data.min_amount) + ')',
			price: ocp.utils.curr(data.price) + '€',
			health: get_health(data.health),
			info: data.country,
			buy: '<a href="">BUY</a>'
		});
	}
	return result;
}

function build_sell_offers_data(data_a, max) {
	max = max || data_a.length;
	var result = [];
	for (var i = 0; i < max; i++) {
		var data = data_a[i];
		result.push({
			amount: ocp.utils.format_size(data.amount) + ' (' + ocp.utils.format_size(data.min_amount) + ')',
			price: ocp.utils.curr(data.price) + '€',
			health: get_health(data.health),
			info: data.country,
			buy: '<a href="">SELL</a>'
		});
	}
	return result;
}

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
	var buy_offers_data = build_buy_offers_data(buy_offers, 7);

	$("#ocp_mp_buy").ocp_grid({
		id: 'ocp_mp_buy',
		column: column,
		data: buy_offers_data
	});

	var sell_offers = ocp.client.command({}, ocp.cfg.server_base_url + '/webocp/server/test/endpoint/get_sell_offers.php');
	var sell_offers_data = build_sell_offers_data(sell_offers, 7);

	column.health.label = 'Min. health';

	$("#ocp_mp_sell").ocp_grid({
		id: 'ocp_mp_sell',
		column: column,
		data: sell_offers_data
	});
});
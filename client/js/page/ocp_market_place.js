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

	$("#ocp_mp_buy").ocp_grid({
		id: 'ocp_mp_buy',
		column: column,
		data: [
			{
				amount: '25GB(1GB)',
				price: '0.10€',
				health: 'good',
				info: 'France',
				buy: '<a href="">BUY</a>'
			},
			{
				amount: '250TB(10GB)',
				price: '0.20€',
				health: 'very good',
				info: 'France',
				buy: '<a href="">BUY</a>'
			},
			{
				amount: '20TB(1GB)',
				price: '0.05€',
				health: 'bad',
				info: 'USA',
				buy: '<a href="">BUY</a>'
			},
			{
				amount: '2TB(1GB)',
				price: '0.10€',
				health: 'not bad',
				info: 'Germany',
				buy: '<a href="">BUY</a>'
			},
			{
				amount: '250TB(10GB)',
				price: '0.20€',
				health: 'very good',
				info: 'France',
				buy: '<a href="">BUY</a>'
			},
			{
				amount: '20TB(1GB)',
				price: '0.05€',
				health: 'bad',
				info: 'USA',
				buy: '<a href="">BUY</a>'
			},
			{
				amount: '2TB(1GB)',
				price: '0.10€',
				health: 'not bad',
				info: 'Germany',
				buy: '<a href="">BUY</a>'
			}
		]
	});
	$("#ocp_mp_sell").ocp_grid({
		id: 'ocp_mp_sell',
		column: column,
		data: [
			{
				amount: '25GB(1GB)',
				price: '0.10€',
				health: 'good',
				info: 'France',
				buy: '<a href="">SELL</a>'
			},
			{
				amount: '250TB(10GB)',
				price: '0.20€',
				health: 'very good',
				info: 'France',
				buy: '<a href="">SELL</a>'
			},
			{
				amount: '20TB(1GB)',
				price: '0.05€',
				health: 'bad',
				info: 'USA',
				buy: '<a href="">SELL</a>'
			},
			{
				amount: '2TB(1GB)',
				price: '0.10€',
				health: 'not bad',
				info: 'Germany',
				buy: '<a href="">SELL</a>'
			},
			{
				amount: '250TB(10GB)',
				price: '0.20€',
				health: 'very good',
				info: 'France',
				buy: '<a href="">SELL</a>'
			},
			{
				amount: '20TB(1GB)',
				price: '0.05€',
				health: 'bad',
				info: 'USA',
				buy: '<a href="">SELL</a>'
			},
			{
				amount: '2TB(1GB)',
				price: '0.10€',
				health: 'not bad',
				info: 'Germany',
				buy: '<a href="">SELL</a>'
			}
		]
	});
});
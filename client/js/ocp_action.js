function build_request_from_fi(href) {
	var fi = href.substr(1);
	var array = fi.split('&');
	var fi_a = [];
	for (var i = 0; i < array.length; i++) {
		var cpl = array[i].split('=');
		fi_a[cpl[0]] = cpl[1];
	}
	console.log(fi_a);
}


$(document).ready(function() {
	$('a[href^=#]').click(function() {
		console.log('inner link');
		var _REQUEST = build_request_from_fi($(this).attr('href'));

	});
});
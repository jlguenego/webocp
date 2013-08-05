var g_request = {};

function build_request_from_fi(href) {
	var fi = get_uri_fi(href);
	var array = fi.split('&');
	g_request = {};
	for (var i = 0; i < array.length; i++) {
		var pair = array[i].split('=');
		g_request[pair[0]] = pair[1];
	}
}

function ocp_action() {
	console.log('ocp_action');
	console.log(g_request);
	if (!g_request.action) {
		ocp_display('cover_page');
		return;
	}

	switch (g_request.action) {
		case 'login':
			ocp_display('login_page');
			break;
		case 'file_manager':
			ocp_display('file_manager');
			break;
		default:
			ocp_display('not_found_page');
	}
}

function ocp_display(page_id) {
	console.log('ocp_display: ' + page_id);
	$('.page_content').css('display', 'none');
	$('#' + page_id).css('display', 'block');
	if ($('#' + page_id + '_button').hasClass('page_selector_header_content')) {
		$('#page').ocp_header_content('set_content', $('#' + page_id));
	}
}

$(document).ready(function() {
	$('a[href^=#]').click(function() {
		console.log('inner link');
		build_request_from_fi($(this).attr('href'));

		ocp_action();
	});

	build_request_from_fi(window.location);
	ocp_action();
});
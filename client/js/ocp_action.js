var g_request = {};

var g_user_is_logged = false;

function build_request_from_fi(href) {
	var fi = get_uri_fi(href);
	var array = fi.split('&');
	g_request = {};
	if (fi.indexOf('=') == -1) {
		g_request.action = fi;
		return;
	}
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
		case 'perform_login':
			if (ocp_action_authenticate()) {
				ocp_display('file_manager');
			} else {
				ocp_display('login_page');
			}
			break;
		case 'logout':
			ocp_action_logout();
			ocp_display('cover_page');
			break;
		case 'file_manager':
			ocp_display('file_manager');
			break;
		case 'register':
			ocp_display('register_page');
			break;
		case 'perform_register':
			ocp_action_register();
			break;
		default:
			ocp_display('not_found_page');
	}
}

function ocp_action_authenticate() {
	g_user_is_logged = true;
	return g_user_is_logged;
}

function ocp_action_logout() {
	g_user_is_logged = false;
}

function ocp_display(page_id) {
	console.log('ocp_display: ' + page_id);
	$('.page_content').css('display', 'none');
	$('#' + page_id).css('display', 'block');
	$('#page').ocp_header_content('set_content', $('#' + page_id));

	if (ocp_user_is_logged()) {
		$('.ocp_state_not_logged').hide();
		$('.ocp_state_logged').show();
	} else {
		$('.ocp_state_logged').hide();
		$('.ocp_state_not_logged').show();
	}
}

function ocp_user_is_logged() {
	return g_user_is_logged;
}

function ocp_action_register() {
	try {
		ajax_register({
			login: $('#ocp_reg_name').val(),
			email: $('#ocp_reg_email').val(),
			password: $('#ocp_reg_password').val()
		});
		ocp_display('register_success_page');
	} catch (e) {
		window.location.hash = '#register';
		// error_manage(e);
		return;
	}
}

$(document).ready(function() {
	$(window).on('hashchange', function () {
    	console.log('window.onhashchange');
    	console.log('window.location.hash=' + window.location.hash);
        build_request_from_fi(window.location.hash);
        ocp_action();
    });

	build_request_from_fi(window.location.hash);
	ocp_action();
});
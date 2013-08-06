var g_request = {};

var g_user_is_logged = false;
var g_session = {};

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
//				if (localStorage.server_base_url) {
//					$('#ocp_fm_tree').ocp_tree('open_item', '/');
//				}
				window.location.hash = '#file_manager';
			} else {
				window.location.hash = '#login';
			}
			break;
		case 'logout':
			ocp_action_logout();
			window.location.hash = '#';
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
	try {
		ocp_val_form_validation('login');

		var email = $('#ocp_lg_email').val();
		var password = $('#ocp_lg_password').val();

		var public_address = ocp_client.hash(email);
		var public_content = {
			email: email,
			name: name
		};
		var private_address = ocp_client.hash(email + password);
		var obj = {
			root_dir: public_address,
		};
		var private_content = ocp_client.pcrypt(password, ocp_client.serialize(obj));

		ajax_login({
			public_object: {
				address: public_address,
				content: public_content
			},
			private_object: {
				address: private_address,
				content: private_content
			}
		});

		g_session = {};
		var email = $('#ocp_lg_email').val();
		g_session.public_address = ocp_client.hash(email);
		g_user_is_logged = true;
	} catch (e) {
		window.location.hash = '#login';
		ocp_error_manage(e);
		return false;
	}

	return g_user_is_logged;
}

function ocp_action_logout() {
	g_session = {};
	g_user_is_logged = false;
}

function ocp_display(page_id) {
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
		var name = $('#ocp_reg_name').val();
		var email = $('#ocp_reg_email').val();
		var password = $('#ocp_reg_password').val();

		ocp_val_form_validation('register');
		var public_address = ocp_client.hash(email);
		var public_content = {
			email: email,
			name: name
		};
		var private_address = ocp_client.hash(email + password);
		var obj = {
			root_dir: public_address,
		};
		var private_content = ocp_client.pcrypt(password, ocp_client.serialize(obj));

		ajax_register({
			public_object: {
				address: public_address,
				content: public_content
			},
			private_object: {
				address: private_address,
				content: private_content
			}
		});
		g_session = {};
		g_session.public_address = public_address;
		ocp_display('register_success_page');
	} catch (e) {
		window.location.hash = '#register';
		ocp_error_manage(e);
		return;
	}
}

$(document).ready(function() {
	$(window).on('hashchange', function () {
        build_request_from_fi(window.location.hash);
        ocp_action();
    });

	build_request_from_fi(window.location.hash);
	ocp_action();
});
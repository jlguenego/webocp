var g_request = {};

(function(ocp, undefined) {
	ocp.action = {};

	ocp.action.build_request_from_fi = function(href) {
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
	};

	ocp.action.execute = function() {
		if (!g_request.action) {
			ocp.action.display('cover_page');
			return;
		}

		switch (g_request.action) {
			case 'login':
				if (ocp.action.user_is_logged()) {
					window.location.hash = '#file_manager';
					return;
				}
				ocp.action.display('login_page');
				break;
			case 'perform_login':
				if (ocp.action.login()) {
					console.log('g_session.public_address=' + g_session.public_address);
					if (g_ocp_client.server_base_url) {
						$('#ocp_fm_tree').ocp_tree('open_item', '/');
					}
					window.location.hash = '#file_manager';
				} else {
					window.location.hash = '#login';
				}
				break;
			case 'logout':
				ocp.action.logout();
				window.location.hash = '#';
				break;
			case 'file_manager':
				if (!ocp.action.require_authentication()) {
					return;
				}
				ocp.action.display('file_manager');
				break;
			case 'register':
				ocp.action.display('register_page');
				break;
			case 'perform_register':
				ocp.action.register();
				break;
			default:
				ocp.action.display('not_found_page');
		}
	};

	ocp.action.login = function() {
		try {
			ocp_val_form_validation('login');

			var email = $('#ocp_lg_email').val();
			var password = $('#ocp_lg_password').val();
			var remember_me = $('#ocp_lg_remember_me').is(':checked');

			var public_address = ocp.hash(email);
			var public_content = {
				email: email,
				name: name
			};
			var private_address = ocp.hash(email + password);
			var obj = {
				root_dir: public_address,
			};
			var private_content = ocp.pcrypt(password, ocp.serialize(obj));

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
			g_session.public_address = public_address;

			if (remember_me) {
				g_ocp_client.session = g_session;
				ocp.saveLocal();
			}

			$('#ocp_lg_email').val('');
			$('#ocp_lg_password').val('');
			$('#ocp_lg_remember_me').prop('checked', false)
				.parent().removeClass('checkboxOn').addClass('checkboxOff');
		} catch (e) {
			window.location.hash = '#login';
			ocp_error_manage(e);
			return false;
		}

		return ocp.action.user_is_logged();
	};

	ocp.action.logout = function() {
		g_session = null;
		g_ocp_client.session = g_session;
		ocp.saveLocal();
	};

	ocp.action.display = function(page_id) {
		$('.page_content').css('display', 'none');
		$('#' + page_id).css('display', 'block');
		$('#page').ocp_header_content('set_content', $('#' + page_id));

		if (ocp.action.user_is_logged()) {
			$('.ocp_state_not_logged').hide();
			$('.ocp_state_logged').show();
		} else {
			$('.ocp_state_logged').hide();
			$('.ocp_state_not_logged').show();
		}
	};

	ocp.action.user_is_logged = function() {
		return (g_session && g_session.public_address);
	}

	ocp.action.require_authentication = function() {
		if (!ocp.action.user_is_logged()) {
			window.location.hash = '#login';
			return false;
		}
		return true;
	}

	ocp.action.register = function() {
		try {
			var name = $('#ocp_reg_name').val();
			var email = $('#ocp_reg_email').val();
			var password = $('#ocp_reg_password').val();

			ocp_val_form_validation('register');
			console.log('ocp=');
			console.log(ocp);
			var public_address = ocp.hash(email);
			var public_content = {
				email: email,
				name: name
			};
			var private_address = ocp.hash(email + password);
			var obj = {
				root_dir: public_address,
			};
			var private_content = ocp.pcrypt(password, ocp.serialize(obj));

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

			$('#ocp_reg_name').val('');
			$('#ocp_reg_email').val('');
			$('#ocp_reg_password').val('');
			$('#register_checkbox').prop('checked', false)
				.parent().removeClass('checkboxOn').addClass('checkboxOff');
			ocp.action.display('register_success_page');
		} catch (e) {
			window.location.hash = '#register';
			ocp_error_manage(e);
			return;
		}
	}
})(ocp);




$(document).ready(function() {
	$(window).on('hashchange', function () {
        ocp.action.build_request_from_fi(window.location.hash);
        ocp.action.execute();
    });

	ocp.action.build_request_from_fi(window.location.hash);
	ocp.action.execute();
});
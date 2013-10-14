var g_request = {};

(function(ocp, undefined) {
	ocp.action = {};

	ocp.action.build_request_from_fi = function(href) {
		g_request = {};
		var fi = get_uri_fi(href);
		var fi_a = fi.split('?');

		g_request.action = fi_a[0];
		if (fi_a.length == 1) {
			return;
		}

		var array = fi_a[1].split('&');

		for (var i = 0; i < array.length; i++) {
			var pair = array[i].split('=');
			g_request[pair[0]] = pair[1];
		}
	};

	ocp.action.execute = function(href) {
		ocp.action.build_request_from_fi(href);
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
				ocp.action.login();
				break;
			case 'logout':
				ocp.action.logout();
				break;
			case 'file_manager':
				if (!ocp.action.require_authentication()) {
					return;
				}
				ocp.file_manager.show_page();
				ocp.action.display('file_manager');
				break;
			case 'register':
				ocp.action.display('register_page');
				break;
			case 'perform_register':
				ocp.action.register();
				break;
			case 'market_place':
				ocp.mp.show_page();
				ocp.action.display('market_place_page');
				break;
			case 'account_management':
				ocp.am.show_page();
				ocp.action.display('account_management_page');
				break;
			default:
				ocp.action.display('not_found_page');
		}
	};

	ocp.action.register = function() {
		try {
			ocp.validation.form('register');

			var args = {
				name: $('#ocp_reg_name').val(),
				email: $('#ocp_reg_email').val(),
				password: $('#ocp_reg_password').val()
			};
			var scenario = ocp.scenario.get(ocp.cfg.scenario);
			scenario.register(args);

			$('#ocp_reg_name').val('');
			$('#ocp_reg_email').val('');
			$('#ocp_reg_password').val('');
			$('#register_checkbox').prop('checked', false)
				.parent().removeClass('checkboxOn').addClass('checkboxOff');

			ocp.action.display('register_success_page');
		} catch (e) {
			window.location.hash = '#register';
			ocp.error_manage(e);
			return;
		}
	}

	ocp.action.login = function() {
		try {
			ocp.validation.form('login');

			var args = {
				email: $('#ocp_lg_email').val(),
				password: $('#ocp_lg_password').val()
			};
			var scenario = ocp.scenario.get(ocp.cfg.scenario);
			scenario.login(args);

			if ($('#ocp_lg_remember_me').is(':checked')) {
				ocp.session.remember_me = true;
				ocp.cfg.session = ocp.session;
				ocp.storage.saveLocal();
			}

			$('#ocp_lg_email').val('');
			$('#ocp_lg_password').val('');
			$('#ocp_lg_remember_me').prop('checked', false)
				.parent().removeClass('checkboxOn').addClass('checkboxOff');

			if (!ocp.action.user_is_logged()) {
				throw new Error('Login failed: bad login/password.');
			}
			window.location.hash = '#file_manager';
		} catch (e) {
			window.location.hash = '#login';
			ocp.error_manage(e);
		}
	};

	ocp.action.logout = function() {
		ocp.session = {};
		ocp.cfg.session = ocp.session;
		ocp.storage.saveLocal();
		window.location.hash = '#';
	};

	ocp.action.display = function(page_id) {
		$('.page_content').css('display', 'none');
		$('#' + page_id).css('display', 'block');

		if (page_id == 'file_manager' || page_id == 'cover_page') {
			$('#page').ocp_fix_variable('option', 'use_min_height', false);
		} else {
			var min_height = $('#' + page_id).attr('data-original_height');
			if (!min_height) {
				$('#' + page_id).attr('data-original_height', $('#' + page_id).outerHeight());
				min_height =  $('#' + page_id).attr('data-original_height');
			}
			$('#page').ocp_fix_variable('option', 'use_min_height', true);
			$('#page').ocp_fix_variable('option', 'min_height', min_height);
		}

		console.log(page_id + '.outerHeight=' + $('#' + page_id).outerHeight());
		$('#page').ocp_fix_variable('set_variable', $('#' + page_id));
		console.log(page_id + '.outerHeight=' + $('#' + page_id).outerHeight());

		if (ocp.action.user_is_logged()) {
			$('.ocp_state_not_logged').hide();
			$('.ocp_state_logged').show();
		} else {
			$('.ocp_state_logged').hide();
			$('.ocp_state_not_logged').show();
		}
	};

	ocp.action.user_is_logged = function() {
		return (ocp.session && ocp.session.user_id);
	}

	ocp.action.require_authentication = function() {
		if (!ocp.action.user_is_logged()) {
			window.location.hash = '#login';
			return false;
		}
		return true;
	}


})(ocp);




$(document).ready(function() {
	$(window).on('hashchange', function () {
		try {
	        ocp.action.execute(window.location.hash);
	    } catch(e) {
	    	window.location.hash = "";
			ocp.error_manage(e);
	    }
    });

	try {
        ocp.action.execute(window.location.hash);
    } catch(e) {
    	window.location.hash = "";
		ocp.error_manage(e);
    }
});
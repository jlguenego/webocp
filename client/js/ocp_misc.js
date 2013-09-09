(function(ocp, undefined) {
	ocp.error_manage = function(e) {
		console.log(e);
		console.log(stacktrace());
		if (!e.msg) {
			throw e;
		}
		$('#ocp_misc_error_dialog').find('span').html(e.msg);
		$('#ocp_misc_error_dialog').ocp_dialog('open');
	};

	ocp.info = function(msg) {
		$('#ocp_misc_info_dialog').find('span').html(msg);
		$('#ocp_misc_info_dialog').ocp_dialog('open');
	};

})(ocp);

$(document).ready(function() {
	$('#page').ocp_header_content({ content: $('#cover_page') });

	$('#header_menu').ocp_menu();
	$('#file_manager_button').ocp_menu();
	$('#login_page_button').ocp_menu();
	$('#cover_page_button').ocp_menu();
	$('#logout_button').ocp_menu();
	$('#register_page_button').ocp_menu();

	console.log('ocp.cfg.server_base_url=' + ocp.cfg.server_base_url);

	var general_settings_dialog = $('#ocp_st_general_settings_dialog').ocp_dialog({
		on_open: function() {
			$('#ocp_st_scenario').ocp_select({
				on_window_load: false
			});
		},

		buttons: {
			Save: function() {
				console.log('ocp=' + ocp);
				var old_scenario = ocp.cfg.scenario;
				ocp.cfg.server_base_url = strip_slash($('#ocp_st_server_base_url').val());
				ocp.cfg.scenario = $('#ocp_st_scenario').val();
				ocp.saveLocal();
				general_settings_dialog.ocp_dialog('close');

				if (old_scenario != ocp.cfg.scenario) {
					console.log('logout');
					ocp.action.logout();
				}
			},
			Cancel: function() {
				general_settings_dialog.ocp_dialog('close');
			}
		}
	});

	$('[href=#general_settings]').click(function(e) {
		e.preventDefault();
		general_settings_dialog.find('#ocp_st_server_base_url').val(ocp.cfg.server_base_url);
		general_settings_dialog.find('#ocp_st_scenario').find('option[value=' + ocp.cfg.scenario + ']').attr('selected', '');
		general_settings_dialog.ocp_dialog('open');
	});

	$('#ocp_misc_error_dialog').ocp_dialog({
		buttons: {
			OK: function() {
				$('#ocp_misc_error_dialog').ocp_dialog('close');
			}
		}
	});

	$('#ocp_misc_info_dialog').ocp_dialog({
		buttons: {
			OK: function() {
				$('#ocp_misc_info_dialog').ocp_dialog('close');
			}
		}
	});

	$('.ocp_footer').html($('#ocp_data_footer').html());

	$('input[type=checkbox]').click(function() {

		if ($(this).is(':checked'))	{
			$(this).parent().removeClass('checkboxOff').addClass('checkboxOn');
		} else {
			$(this).parent().removeClass('checkboxOn').addClass('checkboxOff');
		}
	});
});
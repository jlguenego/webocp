ocp_restore_local();

function ocp_error_manage(e) {
	console.log(e);
	console.log(stacktrace());
	$('#ocp_misc_error_dialog').find('span').html(e.msg);
	$('#ocp_misc_error_dialog').ocp_dialog('open');
}

$(document).ready(function() {
	$('#page').ocp_header_content({ content: $('#cover_page') });

	$('#header_menu').ocp_menu();
	$('#file_manager_button').ocp_menu();
	$('#login_page_button').ocp_menu();
	$('#cover_page_button').ocp_menu();
	$('#logout_button').ocp_menu();
	$('#register_page_button').ocp_menu();

	console.log('g_ocp_client.server_base_url=' + g_ocp_client.server_base_url);

	var general_settings_dialog = $('#ocp_fm_general_settings_dialog').ocp_dialog({
		buttons: {
			Save: function() {
				g_ocp_client.server_base_url = strip_slash($('#ocp_fm_server_base_url').val());
				ocp_save_local();
				general_settings_dialog.ocp_dialog('close');
			},
			Cancel: function() {
				general_settings_dialog.ocp_dialog('close');
			}
		}
	});

	$('[href=#general_settings]').click(function(e) {
		e.preventDefault();
		general_settings_dialog.ocp_dialog('open');
		general_settings_dialog.find('#ocp_fm_server_base_url').val(g_ocp_client.server_base_url);
	});

	$('#ocp_misc_error_dialog').ocp_dialog({
		buttons: {
			OK: function() {
				$('#ocp_misc_error_dialog').ocp_dialog('close');
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
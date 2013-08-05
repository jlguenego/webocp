var g_server_base_url = 'http://localhost';

$(document).ready(function() {
	$('#page').ocp_header_content({ content: $('#cover_page') });

	$('#header_menu').ocp_menu();
	$('#file_manager_button').ocp_menu();
	$('#login_page_button').ocp_menu();
	$('#cover_page_button').ocp_menu();
	$('#register_page_button').ocp_menu();

	var general_settings_dialog = $('#ocp_fm_general_settings_dialog').ocp_dialog({
		buttons: {
			Save: function() {
				g_server_base_url = $('#ocp_fm_general_settings_dialog #ocp_fm_server_base_url').val();
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
		general_settings_dialog.find('#server_base_url').val(g_server_base_url);
	});

	$('.ocp_footer').html($('#ocp_data_footer').html());
});
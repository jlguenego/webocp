var g_server_base_url = 'http://localhost';

$(document).ready(function() {
	$('#page').ocp_header_content({ content: $('#cover_page') });

	$('#header_menu').ocp_menu();
	$('#file_manager_button').ocp_menu();
	$('#cover_page_button').ocp_menu();

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



	// Hide all page but file_manager
	$('.page_content').css('display', 'none');
	$('#cover_page').css('display', 'block');

	$('.page_selector').click(function() {
		$('.page_content').css('display', 'none');
		var id = $(this).attr('id').replace(/_button$/, '');
		$('#' + id).css('display', 'block');
	});

	$('.page_selector_header_content').click(function() {
		var id = $(this).attr('id').replace(/_button$/, '');
		$('#page').ocp_header_content('set_content', $('#' + id));
	});
});
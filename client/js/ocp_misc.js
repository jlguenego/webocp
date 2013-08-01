$(document).ready(function() {
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
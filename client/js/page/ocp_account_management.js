(function(ocp, undefined) {
	ocp.am = {};

	ocp.am.sidebar = function() {
		$('#ocp_am_sidebar a').each(function() {
			$(this).html('<div class="ocp_am_link_button">' + $(this).html() + '</div>');
		});
	};

	var first_time = true;
	ocp.am.show_page = function() {
		$('#account_management_page').show();

		if (!first_time) {
			return;
		}
		first_time = false;
		console.log('execute ocp.am.show_page');
		//$('#ocp_am_body').ocp_text_value();
		$('#account_management_page').ocp_fix_variable({
			fix: $('#account_management_page .ocp_footer'),
			variable: $('#ocp_am_main')
		});
		ocp.am.sidebar();

		$('#ocp_am_main').ocp_fix_variable();

		$('.ocp_am_section').hide();
		$('#ocp_am_details_button').addClass('selected');

		// Section definition
		$('#ocp_am_quota').ocp_quota({ quota: 50 });
		$('#ocp_am_quota').ocp_quota('update', 10);
	};
})(ocp);
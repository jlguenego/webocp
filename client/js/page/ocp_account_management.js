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
		$('#ocp_am_body').ocp_text_value();
		$('#account_management_page').ocp_fix_variable({
			use_min_height: true
		});
		ocp.am.sidebar();

		$('#ocp_am_main').ocp_fix_variable({
			fix: $('#ocp_am_main .ocp_footer'),
			variable: $('#ocp_am_body'),
			use_min_height: true
		});
	};
})(ocp);
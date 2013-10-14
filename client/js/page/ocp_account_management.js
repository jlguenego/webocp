(function(ocp, undefined) {
	ocp.am = {};

	ocp.am.sidebar = function() {
		$('#ocp_am_sidebar a').each(function() {
			$(this).html('<div class="ocp_am_link_button">' + $(this).html() + '</div>');
		});
	};
})(ocp)

$(document).ready(function() {
	//$('#ocp_am_body').ocp_text_value();
	$('#account_management_page').ocp_fix_variable({
		use_min_height: true
	});
	ocp.am.sidebar();
	$('#ocp_am_main').ocp_fix_variable({
		fix: $('#ocp_am_main .ocp_footer'),
		variable: $('#ocp_am_body'),
		use_min_height: true
	});
});

(function(ocp, undefined) {
	ocp.am = {};

	ocp.am.sidebar = function() {
		$('#ocp_am_sidebar a').each(function() {
			$(this).html('<span class="ocp_am_link_button">' + $(this).html() + '</span>');
		});
	};
})(ocp)

$(document).ready(function() {
	$('#account_management_page').ocp_header_content();
	$('#ocp_am_body').ocp_text_value();

	ocp.am.sidebar();
});

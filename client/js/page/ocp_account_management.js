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
		ocp.am.sidebar();


		$('#ocp_am_page').ocp_fix_variable({
			fix: $('#ocp_am_page .ocp_footer'),
			variable: $('#ocp_am_main') });
		$('#ocp_am_main').ocp_fix_variable();
		$('#ocp_am_body').ocp_text_value();

		$('.ocp_am_section').hide();
		$('#ocp_am_details_button').addClass('selected');

		// Section definition
		$('#ocp_am_quota').ocp_quota({ quota: 50 });
		$('#ocp_am_quota').ocp_quota('update', 10);

		// Quota prevision
		var quota = Math.floor((Math.random() * 100) + 1);
		var today = new Date();
		today.setHours(0, 0, 0, 0);
		var midnight_t = Math.floor(today.getTime() / 1000);

		var dataset = [];
		for (var i = 0; i < 365 * 2; i++) {
			if (i % Math.round((Math.random() * 300) + 150) == 0) {
				quota -= Math.random() * 5;
			}
			if (quota < 0) {
				quota = 0;
			}
			dataset.push({
				timestamp: midnight_t + i * 86400,
				quota: quota
			});
		}

		var margin = { top: 20, right: 5, bottom: 20, left: 50 };
		ocp.graphic.draw_quota_view($('#ocp_am_quota_chart svg').get(0), dataset, margin);
	};
})(ocp);
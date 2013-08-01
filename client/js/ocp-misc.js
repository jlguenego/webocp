function ocp_build_grid_data_from_ls_enpoint(ls_data) {
	var result = [];
	for (var i = 0; i < ls_data.length; i++) {
		var row = {};
		row.filename = ls_data[i].label;
		row.size = 'N/A';
		row.last_modified = 'N/A';

		row.meta_data = {
			type: ls_data[i].type,
			mime_type: ls_data[i].mime_type,
		};
		row.info = [
			ls_data[i].type,
			'name:' + ls_data[i].label
		]
		result.push(row);
	}
	return result;
}

function ajax_ls(path) {
	var result = null;
	var dir_result = null;
	$.ajaxSetup({scriptCharset: "utf-8"});
	$.ajax({
		type: "GET",
		url: g_server_base_url + '/webocp/server/endpoint/',
		async: false,
		data: {
			path: path
		},
		success: function(data) {
			result = $.parseJSON(data);
			var grid_result = ocp_build_grid_data_from_ls_enpoint(result);
			$("#grid").ocp_grid('reload', grid_result);
			$('#breadcrumbs input').val(path);
			dir_result = filter_dir(result);
		}
	});
	return dir_result;
}

$(document).ready(function() {
	// Sync path
	$('#breadcrumbs input').keypress(function(e) {
	    if(e.which == 13) {
	        var path = normalize_path($(this).val());
	        console.log('path=' + path);
	        $('#tree').ocp_tree('open_item', path);
	    }
	});

	$('#parent').click(function() {
		var path = $('#breadcrumbs input').val();
		console.log('path=' + path);
		path = dirname(path);
		console.log('path=' + path);
		$('#tree').ocp_tree('open_item', path);
	});

	$('#file_manager_button').click(function() {
		$('.current_displayed').removeClass('current_displayed').addClass('not_displayed');
		$('#file_manager').removeClass('not_displayed').addClass('current_displayed');
	});
	$('#other_page_button').click(function() {
		$('.current_displayed').removeClass('current_displayed').addClass('not_displayed');
		$('#other_page').removeClass('not_displayed').addClass('current_displayed');
	});

	$('#tree').ocp_tree('open_item', '/');
});
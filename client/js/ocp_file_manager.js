function ocp_build_grid_data_from_ls_enpoint(ls_data, path) {
	var result = {};
	var rows = [];
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
		rows.push(row);
	}
	result.rows = rows;
	result.state = { path: path };
	return result;
}

function ajax_ls(path) {
	console.log('start ajax_ls');
	var result = null;
	var dir_result = null;
	$.ajaxSetup({
		cache: false,
		scriptCharset: "utf-8"
	});
	console.log('g_server_base_url=' + g_server_base_url);
	$.ajax({
		type: "GET",
		url: g_server_base_url + '/webocp/server/endpoint/',
		async: false,
		data: {
			path: path
		},
		success: function(data) {
			console.log('start ajax success');
			result = $.parseJSON(data);
			var grid_result = ocp_build_grid_data_from_ls_enpoint(result, path);

			$("#ocp_fm_grid").ocp_grid('reload', grid_result);
			$('#ocp_fm_breadcrumbs input').val(path);
			dir_result = filter_dir(result);
			console.log('ajax ok');
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log('ajax_ls error');
			console.log('jqXHR=' + jqXHR + "\ntextStatus=" + textStatus + "\nerrorThrown=" + errorThrown);
		},
		statusCode: {
			404: function() {
				console.log("page not found");
			}
		}
	});
	console.log(dir_result);
	console.log('end ajax_ls');
	return dir_result;
}

$(document).ready(function() {
	var footer_restore_height = 150;
	$('#ocp_fm_toggle_footer').click(function() {
		var new_height = 0;
		if ($(this).hasClass('ocp_fm_footer_maximize')) { //Maximize
			new_height = footer_restore_height;
			$(this).removeClass('ocp_fm_footer_maximize');
		} else { // Minimize
			footer_restore_height = $('#ocp_fm_footer').outerHeight()
			new_height = $('#ocp_fm_footer_header').outerHeight();
			$(this).addClass('ocp_fm_footer_maximize');
		}
		var size = { bottom: new_height };
		$('#file_manager').ocp_splitpane_v('resize', size);
	});

	// Sync path
	$('#ocp_fm_breadcrumbs input').keypress(function(e) {
	    if(e.which == 13) {
	        var path = normalize_path($(this).val());
	        console.log('path=' + path);
	        $('#ocp_fm_tree').ocp_tree('open_item', path);
	    }
	});

	$('#ocp_fm_parent').click(function() {
		var path = $('#ocp_fm_breadcrumbs input').val();
		console.log('path=' + path);
		path = dirname(path);
		console.log('path=' + path);
		$('#ocp_fm_tree').ocp_tree('open_item', path);
	});

	$('#ocp_fm_tree').ocp_tree('open_item', '/');
});
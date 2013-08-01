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
			var grid_result = ocp_build_grid_data_from_ls_enpoint(result);
			$("#grid").ocp_grid('reload', grid_result);
			$('#breadcrumbs input').val(path);
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
	$('#toggle_footer').click(function() {
		var new_height = 0;
		if ($(this).hasClass('footer_maximize')) { //Maximize
			new_height = footer_restore_height;
			$(this).removeClass('footer_maximize');
		} else { // Minimize
			footer_restore_height = $('#footer').outerHeight()
			new_height = $('#footer_header').outerHeight();
			$(this).addClass('footer_maximize');
		}
		var size = { bottom: new_height };
		$('#file_manager').ocp_splitpane_v('resize', size);
	});

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

	// Hide all page but file_manager
	$('.page_content').css('display', 'none');
	$('#file_manager').css('display', 'block');

	$('.page_selector').click(function() {
		$('.page_content').css('display', 'none');
		var id = $(this).attr('id').replace(/_button$/, '');
		$('#' + id).css('display', 'block');
	});

	$('#tree').ocp_tree('open_item', '/');
});
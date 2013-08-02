function ajax_command(data) {
	$.ajaxSetup({
		cache: false,
		scriptCharset: "utf-8"
	});

	var result = null;
	$.ajax({
		type: "GET",
		url: g_server_base_url + '/webocp/server/endpoint/',
		async: false,
		data: data,
		success: function(data) {
			var output = $.parseJSON(data);
			if (output.error) {
				throw output.error;
			}
			if (output.result) {
				result = output.result;
			}
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

	return result;
}

function ajax_ls(path) {
	var result = ajax_command({
		action: 'ls',
		path: path
	});

	var grid_result = ocp_build_grid_data_from_ls_enpoint(result, path);

	grid_result.rows = reorder_grid_result(grid_result.rows);
	$("#ocp_fm_grid").ocp_grid('reload', grid_result);
	$('#ocp_fm_breadcrumbs input').val(path);
	return filter_dir(result);
}

function ajax_mkdir(path, name) {
	ajax_command({
		action: 'mkdir',
		path: path,
		name: name
	});
}

function ajax_mv(old_path, new_path) {
	ajax_command({
		action: 'mv',
		old_path: old_path,
		new_path: new_path,
	});
}

function ajax_rm(path) {
	ajax_command({
		action: 'rm',
		path: path,
	});
}
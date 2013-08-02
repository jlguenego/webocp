function ajax_ls(path) {
	var result = null;
	var dir_result = null;
	$.ajaxSetup({
		cache: false,
		scriptCharset: "utf-8"
	});
	$.ajax({
		type: "GET",
		url: g_server_base_url + '/webocp/server/endpoint/',
		async: false,
		data: {
			action: 'ls',
			path: path
		},
		success: function(data) {
			var output = $.parseJSON(data);
			result = output.result;
			var grid_result = ocp_build_grid_data_from_ls_enpoint(result, path);

			grid_result.rows = reorder_grid_result(grid_result.rows);
			$("#ocp_fm_grid").ocp_grid('reload', grid_result);
			$('#ocp_fm_breadcrumbs input').val(path);
			dir_result = filter_dir(result);
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
	return dir_result;
}

function ajax_mkdir(path, name) {
	$.ajaxSetup({
		cache: false,
		scriptCharset: "utf-8"
	});
	console.log(g_server_base_url + '/webocp/server/endpoint/?action=mkdir&path=' + encodeURIComponent(path) + '&name=' + name);
	$.ajax({
		type: "GET",
		url: g_server_base_url + '/webocp/server/endpoint/',
		async: false,
		data: {
			action: 'mkdir',
			path: path,
			name: name
		},
		success: function(data) {
			var output = $.parseJSON(data);
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
}
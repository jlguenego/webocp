(function(ocp, undefined) {
	ocp.client = {};

	ocp.client.command = function(data, url) {
		if (!url) {
			url = ocp.cfg.server_base_url + '/webocp/server/endpoint/';
		}
		$.ajaxSetup({
			cache: false,
			scriptCharset: "utf-8"
		});

		var result = null;
		console.log(data);
		console.log('url=' + url);
		$.ajax({
			type: "GET",
			url: url,
			async: false,
			data: data,
			success: function(data) {
				console.log(data);
				var output = $.parseJSON(data);
				if (output.error) {
					throw new OCPException('Server answered: ' + output.error);
				}
				if (output.result) {
					result = output.result;
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				console.log('ocp.client error');
				console.log('jqXHR=' + jqXHR + "\ntextStatus=" + textStatus + "\nerrorThrown=" + errorThrown);
			},
			statusCode: {
				404: function() {
					console.log("page not found");
				}
			}
		});

		return result;
	};

	ocp.client.ls = function(path) {
		var scenario = ocp.scenario.get(ocp.cfg.scenario);
		var result = scenario.ls(path);

		var grid_result = ocp.file_manager.build_grid_data_from_ls_enpoint(result, path);

		grid_result.rows = ocp.file_manager.reorder_grid_result(grid_result.rows);
		$("#ocp_fm_grid").ocp_grid('reload', grid_result);
		$('#ocp_fm_breadcrumbs input').val(path);
		return ocp.file_manager.filter_dir(result);
	}

	ocp.client.mkdir = function(path, name) {
		var scenario = ocp.scenario.get(ocp.cfg.scenario);
		var result = scenario.mkdir(path, name);
	}

	ocp.client.mv = function(old_path, new_path) {
		var scenario = ocp.scenario.get(ocp.cfg.scenario);
		var result = scenario.mv(old_path, new_path);
	}

	ocp.client.rm = function(path) {
		var scenario = ocp.scenario.get(ocp.cfg.scenario);
		var result = scenario.rm(path);
	}

	ocp.client.upload_dir = function(path, relative_path, form, after_success) {
		var scenario = ocp.scenario.get(ocp.cfg.scenario);
		var result = scenario.upload_dir(path, relative_path, form, after_success);
		return result;
	}

	ocp.client.upload_file = function(path, file, after_success, on_progress) {
		var scenario = ocp.scenario.get(ocp.cfg.scenario);
		var result = scenario.upload_file(path, file, after_success, on_progress);
		return result;
	};

	ocp.client.download_file = function(path) {
		console.log('ocp.client.download_file, path=' + path);
		window.location = ocp.cfg.server_base_url + '/webocp/server/endpoint/download.php?path=' + '/' + ocp.session.user_id + path;
	}
})(ocp);
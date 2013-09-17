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
					throw new Error('Server answered: ' + output.error);
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

	ocp.client.async_command = function(data, url, on_success, on_error) {
		$.ajaxSetup({
			cache: false,
			scriptCharset: "utf-8"
		});

		console.log(data);
		console.log('url=' + url);
		$.ajax({
			type: "GET",
			url: url,
			async: true,
			data: data,
			success: function(data) {
				console.log(data);
				var output = $.parseJSON(data);
				if (output.error) {
					if (on_error) {
						on_error();
					}
					ocp.error_manage(new Error('Server answered: ' + output.error));
					return;
				}
				if (on_success) {
					on_success(output.result);
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				console.log('ocp.client error');
				console.log('jqXHR=' + jqXHR + "\ntextStatus=" + textStatus + "\nerrorThrown=" + errorThrown);
				console.log(jqXHR);
				if (on_error) {
					on_error();
				}
				if (jqXHR.status == 0) {
					ocp.error_manage(new Error('URL ' + url + ' not reachable.'));
				} else {
					ocp.error_manage(new Error(errorThrown));
				}
			},
			statusCode: {
				404: function() {
					console.log("page not found");
				}
			}
		});
	};

	ocp.client.ls = function(path, on_success, on_error) {
		var scenario = ocp.scenario.get(ocp.cfg.scenario);

		var my_on_success = function(result) {
			var grid_result = ocp.file_manager.build_grid_data_from_ls_enpoint(result, path);

			grid_result.rows = ocp.file_manager.reorder_grid_result(grid_result.rows);
			$("#ocp_fm_grid").ocp_grid('reload', grid_result);
			$('#ocp_fm_breadcrumbs input').val(path);
			var dir_result = ocp.file_manager.filter_dir(result);
			on_success(dir_result);
		};

		scenario.ls(path, my_on_success, on_error);
	}

	ocp.client.mkdir = function(path, name, on_success, on_error) {
		var scenario = ocp.scenario.get(ocp.cfg.scenario);
		var result = scenario.mkdir(path, name, on_success, on_error);
	}

	ocp.client.mv = function(old_path, new_path) {
		var scenario = ocp.scenario.get(ocp.cfg.scenario);
		var result = scenario.mv(old_path, new_path);
	}

	ocp.client.rm = function(path, on_success, on_error) {
		var scenario = ocp.scenario.get(ocp.cfg.scenario);
		var result = scenario.rm(path, on_success, on_error);
	}

	ocp.client.upload_dir = function(path, files, after_success_func, on_progress_func) {
		for (var i = 0; i < files.length; i++) {
			var file = files[i];
			if (/\/\.$/.test(file.webkitRelativePath)) { // end with '/.'
				console.log(file.webkitRelativePath + ' is dir');
				var name = ocp.basename(file.webkitRelativePath);
				console.log('name=' + name);
				ocp.client.mkdir(path + ocp.dirname(file.webkitRelativePath), name);
			} else {
				console.log(file.webkitRelativePath + ' is file');
				ocp.client.upload_file(path + ocp.dirname(file.webkitRelativePath), file, after_success_func, on_progress_func);
			}
			console.log('file=');
			console.log(file);
		}
	}

	ocp.client.upload_file = function(path, file, after_success, on_progress) {
		var scenario = ocp.scenario.get(ocp.cfg.scenario);
		var result = scenario.upload_file(path, file, after_success, on_progress);
		return result;
	};

	ocp.client.download_file = function(path) {
		var scenario = ocp.scenario.get(ocp.cfg.scenario);
		scenario.download_file(path);
		console.log('ocp.client.download_file, path=' + path);
	}
})(ocp);
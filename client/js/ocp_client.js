(function(ocp, undefined) {
	ocp.client = {};

	var pool = null;
	$(document).ready(function() {
		var url = ocp.worker_ui.getURL('js/worker/ocp_upload_dir.js');
		var pool_nbr = ocp.cfg.pool.thread_nbr.upload_dir || 3;
		pool = new ocp.worker_ui.pool.Pool(pool_nbr, url);
		ocp.client.upload_dir_pool = pool;
	});

	ocp.client.command = function(data, url) {
		if (!url) {
			throw new Error('No URL given.');
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
				//console.log(data);
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
				throw new Error('It seems that the server is not responding...');
			},
			statusCode: {
				404: function() {
					console.log("page not found");
				}
			}
		});

		return result;
	};

	ocp.client.async_command = function(data, url, onsuccess, onerror) {
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
					if (onerror) {
						onerror();
					}
					ocp.error_manage(new Error('Server answered: ' + output.error));
					return;
				}
				if (onsuccess) {
					onsuccess(output.result);
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				console.log('ocp.client error');
				console.log('jqXHR=' + jqXHR + "\ntextStatus=" + textStatus + "\nerrorThrown=" + errorThrown);
				console.log(jqXHR);
				if (onerror) {
					onerror();
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

	ocp.client.ls = function(path, onsuccess, onerror) {
		var scenario = ocp.scenario.get(ocp.cfg.scenario);

		var my_onsuccess = function(result) {
			console.log('ls result=');
			console.log(result);
			var grid_result = ocp.file_manager.build_grid_data_from_ls_enpoint(result, path);

			$("#ocp_fm_grid").ocp_grid('reload', grid_result);
			$('#ocp_fm_breadcrumbs input').val(path);
			var dir_result = ocp.file_manager.filter_dir(result);
			onsuccess(dir_result);
		};

		scenario.ls(path, my_onsuccess, onerror);
	}

	ocp.client.mkdir = function(path, name, onsuccess, onerror) {
		var scenario = ocp.scenario.get(ocp.cfg.scenario);
		var result = scenario.mkdir(path, name, onsuccess, onerror);
	}

	ocp.client.mv = function(old_path, new_path) {
		var scenario = ocp.scenario.get(ocp.cfg.scenario);
		var result = scenario.mv(old_path, new_path);
	}

	ocp.client.rm = function(path, onsuccess, onerror) {
		var scenario = ocp.scenario.get(ocp.cfg.scenario);
		var result = scenario.rm(path, onsuccess, onerror);
	}

	ocp.client.upload_files = function(path, file_descr_list, onsuccess, onprogress) {
		console.log('upload_files');
		console.log(file_descr_list);

		for (var i = 0; i < file_descr_list.length; i++) {
			ocp.client.add_upload_task(path, file_descr_list[i], onsuccess, onprogress);
		}
		console.log(pool);
	};

	ocp.client.add_upload_task = function(path, file_descr, onsuccess, onprogress) {
		var task_callback = function(event) {
			console.log(event.data);
			switch (event.data.action) {
				case 'mkdir':
					ocp.client.mkdir(
						event.data.path,
						event.data.name,
						function() {
							var task = pool.getTask(event.data.task_id);
							task.sendMessage('finalize');
							onsuccess();
						});
					break;
				case 'upload_file':
					ocp.client.upload_file(
						event.data.filename,
						event.data.file,
						function() {
							var task = pool.getTask(event.data.task_id);
							task.sendMessage('finalize');
							onsuccess();
						},
						onprogress({
							path: event.data.path,
							name: event.data.file.name,
							size: event.data.file.size,
							transfer_type: 'upload'
						}));
					break;
				case 'finalize':
					break;
			}
		};


		var file = file_descr.file;
		var type = file_descr.type;
		var relative_path = file_descr.relative_path;
		console.log('file=');
		console.log(file);
		var task = null;
		if (type == 'dir') {
			console.log('file type is dir');
			console.log('relative_path=' + relative_path);
			var mypath = ocp.normalize_path(path + '/' + ocp.dirname(relative_path));
			console.log('mypath=' + mypath);
			var name = ocp.basename(relative_path);
			console.log('name=' + name);
			var task_args = {
				path: mypath,
				name: name
			};
			var task_id = ocp.normalize_path(mypath + '/' + name);
			task = new ocp.worker_ui.pool.Task(task_id, 'mkdir', task_args, task_callback);
		} else {
			console.log('file type is file');
			var task_args = {
				filename: ocp.normalize_path(path + '/' + ocp.dirname(relative_path)),
				file: file
			};
			var task_id = ocp.normalize_path(task_args.filename + '/' + task_args.file.name);
			task = new ocp.worker_ui.pool.Task(task_id, 'upload_file', task_args, task_callback);
		}
		pool.addTask(task);
	};

	ocp.client.upload_file = function(path, file, onsuccess, onprogress) {
		var scenario = ocp.scenario.get(ocp.cfg.scenario);
		var result = scenario.upload_file(path, file, onsuccess, onprogress);
		return result;
	};

	ocp.client.download_file = function(path, onsuccess, onprogress, onerror) {
		var scenario = ocp.scenario.get(ocp.cfg.scenario);
		scenario.download_file(path, onsuccess, onprogress, onerror);
		console.log('ocp.client.download_file, path=' + path);
	}
})(ocp);
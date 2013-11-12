(function(ocp, undefined) {
	ocp.filesystem = {};

	var pool = null;
	$(document).ready(function() {
		var url = ocp.worker_ui.getURL('js/worker/ocp_upload_dir.js');
		var pool_nbr = ocp.cfg.pool.thread_nbr.upload_dir || 3;
		pool = new ocp.worker_ui.pool.Pool(pool_nbr, url);
		ocp.filesystem.upload_dir_pool = pool;
	});

	ocp.filesystem.ls = function(path, onsuccess, onerror) {
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

	ocp.filesystem.mkdir = function(path, name, onsuccess, onerror) {
		var scenario = ocp.scenario.get(ocp.cfg.scenario);
		var result = scenario.mkdir(path, name, onsuccess, onerror);
	}

	ocp.filesystem.mv = function(old_path, new_path) {
		var scenario = ocp.scenario.get(ocp.cfg.scenario);
		var result = scenario.mv(old_path, new_path);
	}

	ocp.filesystem.rm = function(path, onsuccess, onerror) {
		var scenario = ocp.scenario.get(ocp.cfg.scenario);
		var result = scenario.rm(path, onsuccess, onerror);
	}

	ocp.filesystem.upload_files = function(path, file_descr_list, onsuccess, onprogress) {
		console.log('upload_files');
		console.log(file_descr_list);

		for (var i = 0; i < file_descr_list.length; i++) {
			ocp.filesystem.add_upload_task(path, file_descr_list[i], onsuccess, onprogress);
		}
		console.log(pool);
	};

	ocp.filesystem.add_upload_task = function(path, file_descr, onsuccess, onprogress) {
		var task_callback = function(event) {
			console.log(event.data);
			switch (event.data.action) {
				case 'mkdir':
					ocp.filesystem.mkdir(
						event.data.path,
						event.data.name,
						function() {
							var task = pool.getTask(event.data.task_id);
							task.sendMessage('finalize');
							onsuccess();
						});
					break;
				case 'upload_file':
					ocp.filesystem.upload_file(
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

	ocp.filesystem.upload_file = function(path, file, onsuccess, onprogress) {
		var scenario = ocp.scenario.get(ocp.cfg.scenario);
		var result = scenario.upload_file(path, file, onsuccess, onprogress);
		return result;
	};

	ocp.filesystem.download_file = function(path, onsuccess, onprogress, onerror) {
		var scenario = ocp.scenario.get(ocp.cfg.scenario);
		scenario.download_file(path, onsuccess, onprogress, onerror);
		console.log('ocp.filesystem.download_file, path=' + path);
	}
})(ocp);
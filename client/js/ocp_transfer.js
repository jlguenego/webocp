(function(ocp, undefined) {
	ocp.transfer = {};

	ocp.transfer.upload = function(args) {
		var file = args.file;
		var secret_key = args.secret_key;
		var progress_bar = args.progress_bar;
		var total_task = 1;
		var total_performed = 0;
		var url = ocp.worker_ui.getURL('js/worker/ocp_upload.js');
		var pool_nbr = ocp.cfg.upload_connection_nbr || 5;
		var pool = new ocp.worker_ui.pool.Pool(pool_nbr, url);
		var cursor = 0;
		var block_size = ocp.cfg.block_size || 1 << 16;
		var hat_worker = new Hat();
		var block_id = 0;


		if (args.pool_view) {
			args.pool_view.ocp_pool_view('attach', pool);
		}

		while (cursor < file.size) {
			var cursor_next = cursor + block_size;

			var args = {
				file: file,
				cursor: cursor,
				cursor_next: cursor_next,
				block_id: block_id,
				secret_key: secret_key,
				server_uri: ocp.cfg.server_base_url
			};

			var callback_func = function(event) {
				console.log(event.data);
				check_error(event.data);
				if (event.data.action == 'send') {
					ocp.transfer.send_worker_block(event.data, function() {
						var task = pool.getTask(event.data.task_id);
						task.sendMessage('finalize');
					});
				} else if (event.data.action == 'push') {
					hat_worker.push({
						filename: event.data.filename,
						block_id: event.data.block_id
					});
				}

				var progress = update_progress_from_task(event.data);
				progress_bar.ocp_progressbar('set_progress', progress);
			};

			var task = new ocp.worker_ui.pool.Task(block_id, 'upload_block', args, callback_func);
			pool.addTask(task);
			total_task++;

			cursor = cursor_next;
			block_id++;
		}

		function Hat() {
			var hat_callback = function(event) {
				console.log(event.data);
				check_error(event.data);
				if (event.data.action == 'send') {
					ocp.transfer.send_worker_block(event.data, function() {
						var task = pool.getTask(event.data.task_id);
						task.sendMessage('finalize');
					});
				} else if (event.data.action == 'finalize') {
					$('#upload_name').html(event.data.filename);
				}

				var progress = update_progress_from_task(event.data);
				progress_bar.ocp_progressbar('set_progress', progress);

				pool.terminate();
			};

			var hat_args = {
				file: file,
				block_size: block_size,
				server_uri: ocp.cfg.server_base_url,
				secret_key: secret_key,
				message: 'init'
			};

			var task = new ocp.worker_ui.pool.Task('hat', 'upload_hat', hat_args, hat_callback);
			pool.addTask(task);

			this.push = function(data) {
				console.log('push');
				console.log(data);
				task.sendMessage('push', {
					filename: data.filename,
					block_id: data.block_id
				});
			};
		}

		function update_progress_from_task(obj) {
			if (total_task <= 0) {
				return 100;
			}
			if (obj.finish) {
				total_performed++;
			}
			return Math.floor(total_performed * 100 / total_task);
		}

		function check_error(data) {
			if (!data.exception) {
				return;
			}
			var e = new Error(data.exception);
			console.log('e=');
			console.log(e);
			console.log(e.stack);
			console.log(e.toString());
			pool.terminate(true);
			throw e;
		}
	};

	ocp.transfer.download = function() {
		var worker_url = ocp.worker_ui.getURL('js/worker/ocp_download.js');
		var tm = {
			total_task: 1, // download hat is the first task
			total_performed: 0
		};
		var pool_nbr = ocp.cfg.download_connection_nbr || 5;
		var pool = new ocp.worker_ui.pool.Pool(pool_nbr, worker_url);
		var filename = args.filename;
		var secret_key = args.secret_key;
		var progress_bar = args.progress_bar;
		var blocks = [];

		if (args.pool_view) {
			args.pool_view.ocp_pool_view('attach', pool);
		}

		var hat_args = {
			block_name: filename,
			server_uri: ocp.cfg.server_base_url,
			secret_key: secret_key
		};

		var hat_callback = function() {
			console.log(event.data);
			if (event.data.hat) {
				for (var i = 0; i < event.data.hat.block_nbr; i++) {
					create_task(event.data.hat, i);
				}
				pool.terminate(); // Nice
			}

			update_progress(event.data);
		};

		var task = new ocp.worker_ui.pool.Task('hat', 'download_hat', hat_args, hat_callback);
		pool.addTask(task);

		function update_progress(obj) {
			if (tm.total_task <= 0) {
				progress_bar.ocp_progressbar('set_progress', 100);
				return;
			}
			if (obj.finish) {
				tm.total_performed++;
			}
			var progress =  Math.floor(tm.total_performed * 100 / tm.total_task);
			console.log('tm=');
			console.log(tm);
			progress_bar.ocp_progressbar('set_progress', progress);
		}

		function create_task(hat, i) {
			var task_args = {
				block_id: i,
				block_name: hat.summary[i],
				secret_key: secret_key,
				server_uri: ocp.cfg.server_base_url,
				block_size: hat.block_size,
				hat_name: filename
			};
			tm.total_task++;
			var task_callback = function(event) {
				update_progress(event.data);

				if (event.data.block_written) {
					blocks.push(event.data.block_id);

					console.log('pushed block_id: ' + event.data.block_id)
					console.log('blocks.length=' + blocks.length);
					console.log('hat.block_nbr=' + hat.block_nbr);
				}
				if (blocks.length == hat.block_nbr) {
					console.log('download_finalize');
					finalize();
				}
			}
			var task = new ocp.worker_ui.pool.Task(i, 'download_block', task_args, task_callback);
			pool.addTask(task);
		}

		function finalize() {
			window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
			window.requestFileSystem(window.TEMPORARY, 1024 * 1024 * 1024, function(filesystem) {
				filesystem.root.getFile(filename, {create: false}, function(fileEntry) {
					console.log(fileEntry);
					var url = fileEntry.toURL();
					console.log(url);
					var link = $('<a/>');
					link.attr('href', url).attr('download', filename);
					console.log(link[0]);
					//link.html('xxx');
					//$('body').append(link);
					link[0].click();
				}, errorHandler('getFile'));
			}, errorHandler('requestFileSystem'));
		}

		function errorHandler(tag) {
			return function(e) {
				console.log(tag + ' Error=');
				console.log(e);
			}
		}
	};

	ocp.transfer.send_worker_block = function(args, on_success) {
		ocp.file.send(args.filename, args.content, on_success);
	};

})(ocp);
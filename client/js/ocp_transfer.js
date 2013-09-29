(function(ocp, undefined) {
	if (console) {
		//console.log = function() {};
	}

	ocp.transfer = {};

	ocp.transfer.onprogress = function(task_id, task_array, onprogress) {
		return function(e) {
			console.log('task_id=' + task_id);
			if (e) {
				task_array[task_id] = e.loaded / e.total;
			}
			console.log(task_array);

			var performed = ocp.transfer.compute_progression(task_array);

			onprogress(performed);
		};
	};

	ocp.transfer.compute_progression = function(task_array) {
		var sum = 0;
		for (var i = 0; i < task_array.length; i++) {
			sum += task_array[i];
		}
		return Math.floor(sum * 100 / task_array.length);
	};

	ocp.transfer.upload = function(args, on_success) {
		var file = args.file;
		var secret_key = args.secret_key;
		var onprogress = args.onprogress;
		var task_array = [ 0 ];
		var url = ocp.worker_ui.getURL('js/worker/ocp_upload.js');
		var pool_nbr = ocp.cfg.pool.thread_nbr.upload_file || 5;
		var pool = new ocp.worker_ui.pool.Pool(pool_nbr, url);
		var cursor = 0;
		var block_size = ocp.cfg.block_size || 1 << 19;
		console.log('block_size=' + block_size);
		console.log('ocp.cfg.block_size=' + ocp.cfg.block_size);
		var hat_worker = new Hat();
		var block_id = 0;

		if (args.pool_view) {
			args.pool_view.ocp_pool_view('attach', pool);
		}

		pool.send_update_event = false;
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

			var callback_func;
			(function(block_id) {
				callback_func = function(event) {
					check_error(event.data);
					if (event.data.action == 'send') {
						ocp.transfer.send_worker_block(event.data, function() {
							var task = pool.getTask(event.data.task_id);
							task.sendMessage('finalize');
						}, ocp.transfer.onprogress(block_id, task_array, onprogress));
					} else if (event.data.action == 'push') {
						hat_worker.push({
							filename: event.data.filename,
							block_id: event.data.block_id
						});
					}
				};
			})(block_id);

			var task = new ocp.worker_ui.pool.Task(block_id, 'upload_block', args, callback_func);
			pool.addTask(task);
			task_array.push(0);

			cursor = cursor_next;
			block_id++;
		}
		pool.send_update_event = true;

		function Hat() {
			var hat_callback = function(event) {
				check_error(event.data);
				if (event.data.action == 'send') {
					ocp.transfer.send_worker_block(event.data, function() {
						var task = pool.getTask(event.data.task_id);
						task.sendMessage('finalize');
					}, ocp.transfer.onprogress(task_array.length - 1, task_array, onprogress));
				} else if (event.data.action == 'finalize') {
					on_success(event.data.filename);
				}
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

		function check_error(data) {
			console.log(data);
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

	ocp.transfer.download = function(args, onsuccess, onerror) {
		onsuccess = onsuccess || function() {};
		onerror = onerror || function() {};
		var worker_url = ocp.worker_ui.getURL('js/worker/ocp_download.js');
		var pool_nbr = ocp.cfg.pool.thread_nbr.download_file || 6;
		var pool = new ocp.worker_ui.pool.Pool(pool_nbr, worker_url);
		var saveasname = args.saveasname;
		var filename = args.filename;
		var secret_key = args.secret_key;
		var onprogress = args.onprogress;
		var task_array = null;
		var written_block = 0;
		var hat = null;

		function clean() {
			if (pool) {
				pool.terminate(true);
				pool = null;
			}
		}

		if (args.pool_view) {
			args.pool_view.ocp_pool_view('attach', pool);
		}

		var hat_args = {
			block_name: filename,
			server_uri: ocp.cfg.server_base_url,
			secret_key: secret_key
		};

		var hat_callback = function() {
			if (event.data.action == 'retrieve') {
				var args = event.data;
				ocp.transfer.retrieve_worker_block(
					event.data,
					function(content) {
						var task = pool.getTask(args.task_id);
						task.sendMessage('finalize', {
							content: content,
							block_name: args.filename,
							secret_key: secret_key
						});
					},
					null,
					function(error_msg) {
						clean();
						onerror(error_msg);
					});
			} else if (event.data.action == 'finalize') {
				hat = event.data.hat;

				task_array = [];
				for (var i = 0; i < event.data.hat.block_nbr; i++) {
					task_array.push(0);
				}
				task_array.push(1);

				(ocp.transfer.onprogress(0, task_array, onprogress))(null);
				for (var i = 0; i < event.data.hat.block_nbr; i++) {
					create_task(event.data.hat, i);
				}
				pool.terminate(); // Nice
			}
		};

		var task = new ocp.worker_ui.pool.Task('hat', 'download_hat', hat_args, hat_callback);
		pool.addTask(task);

		function create_task(hat, i) {
			var task_args = {
				block_id: i,
				block_name: hat.summary[i],
				secret_key: secret_key,
				server_uri: ocp.cfg.server_base_url,
				block_size: hat.block_size,
				hat_name: filename
			};
			var task_callback = function(event) {
				if (event.data.action == 'retrieve') {
					var args = event.data;
					ocp.transfer.retrieve_worker_block(
						event.data,
						function(content) {
							var task = pool.getTask(args.task_id);
							task.sendMessage('finalize', {
								block_name: args.filename,
								content: content,
								secret_key: secret_key,
								hat_name: filename,
								block_id: args.block_id,
								block_size: hat.block_size
							});
						},
						ocp.transfer.onprogress(args.block_id, task_array, onprogress),
						function(error_msg) {
							clean();
							onerror(error_msg);
						}
					);
				} else if (event.data.action == 'finalize') {
					written_block++;
					if (written_block == hat.block_nbr) {
						finalize();
					}
				}
			}
			var task = new ocp.worker_ui.pool.Task(i, 'download_block', task_args, task_callback);
			pool.addTask(task);
		}

		function finalize() {
			window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
			window.requestFileSystem(window.TEMPORARY, 1024 * 1024 * 1024, function(filesystem) {
				filesystem.root.getFile(filename, {create: false}, function(fileEntry) {
					var url = fileEntry.toURL();
					console.log(url);
					var link = $('<a/>');
					link.attr('href', url).attr('download', saveasname);
					console.log(link[0]);
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

	ocp.transfer.remove = function(args, onsuccess, onerror) {
		onsuccess = onsuccess || function() {};
		onerror = onerror || function() {};
		var worker_url = ocp.worker_ui.getURL('js/worker/ocp_remove.js');
		var pool_nbr = ocp.cfg.pool.thread_nbr.download || 6;
		var pool = new ocp.worker_ui.pool.Pool(pool_nbr, worker_url);
		var filename = args.filename;
		var secret_key = args.secret_key;
		var onprogress = args.onprogress || function() {};
		var task_array = null;
		var removed_block = 0;
		var hat = null;

		function clean() {
			if (pool) {
				pool.terminate(true);
				pool = null;
			}
		}

		if (args.pool_view) {
			args.pool_view.ocp_pool_view('attach', pool);
		}

		var hat_args = {
			block_name: filename,
			server_uri: ocp.cfg.server_base_url,
			secret_key: secret_key
		};

		var hat_callback = function() {
			if (event.data.action == 'retrieve') {
				var args = event.data;
				ocp.transfer.retrieve_worker_block(
					event.data,
					function(content) {
						var task = pool.getTask(args.task_id);
						task.sendMessage('finalize', {
							content: content,
							block_name: args.filename,
							secret_key: secret_key
						});
					},
					null,
					function(error_msg) {
						console.log('error_msg = ' + error_msg);
						clean();
						onerror(error_msg);
					}
				);
			} else if (event.data.action == 'finalize') {
				hat = event.data.hat;

				task_array = [];
				for (var i = 0; i < event.data.hat.block_nbr; i++) {
					task_array.push(0);
				}
				task_array.push(0);

				(ocp.transfer.onprogress(0, task_array, onprogress))(null);
				for (var i = 0; i < event.data.hat.block_nbr; i++) {
					create_task(event.data.hat, i);
				}
				pool.terminate(); // Nice
			}
		};

		var task = new ocp.worker_ui.pool.Task('hat', 'download_hat', hat_args, hat_callback);
		pool.addTask(task);

		function create_task(hat, i) {
			var task_args = {
				block_id: i,
				block_name: hat.summary[i],
				secret_key: secret_key,
				server_uri: ocp.cfg.server_base_url,
				block_size: hat.block_size,
				hat_name: filename
			};
			var task_callback = function(event) {
				if (event.data.action == 'remove') {
					var args = event.data;
					ocp.transfer.remove_worker_block(event.data, function(content) {
						var task = pool.getTask(args.task_id);
						task.sendMessage('finalize', {
							block_id: args.block_id,
						});
					}, ocp.transfer.onprogress(args.block_id, task_array, onprogress));
				} else if (event.data.action == 'finalize') {
					removed_block++;
					if (removed_block == hat.block_nbr) {
						finalize();
					}
				}
			}
			var task = new ocp.worker_ui.pool.Task(i, 'remove_block', task_args, task_callback);
			pool.addTask(task);
		}

		function finalize() {
			// remove the hat as well.
			ocp.transfer.remove_worker_block(
				{ filename: filename },
				null,
				ocp.transfer.onprogress(hat.block_nbr, task_array, onprogress));
			onsuccess();
		}

		function errorHandler(tag) {
			return function(e) {
				console.log(tag + ' Error=');
				console.log(e);
			}
		}
	};

	ocp.transfer.send_worker_block = function(args, on_success, onprogress) {
		ocp.file.send(args.filename, args.content, on_success, onprogress);
	};

	ocp.transfer.retrieve_worker_block = function(args, on_success, onprogress, on_error) {
		ocp.file.retrieve(args.filename, on_success, onprogress, on_error);
	};

	ocp.transfer.remove_worker_block = function(args, on_success, onprogress) {
		ocp.file.remove(args.filename, on_success, onprogress);
	};
})(ocp);
﻿var console = null;
var report = null;

(function(ocp, undefined) {
	ocp.worker = {};

	ocp.worker.init = function(worker, used_in_pool) {
		this.worker = worker;
		if (console == null) {
			console = {};
			if (used_in_pool) {
				console.log = function(msg) {
					worker.postMessage({
						console: msg,
						thread: worker.thread_name,
						task_id: worker.task_id,
						task_name: worker.task_name
					});
				};
			} else {
				console.log = function(msg) {
					worker.postMessage({
						console: msg
					});
				};
			}
		}
		if (report == null) {
			report = function(obj) {
				worker.postMessage(obj);
			}
		}
		if (used_in_pool) {
			worker.onmessage = ocp.worker.run(worker);
		} else {
			worker.onmessage = worker.run;
		}

		if (worker.init) {
			worker.init();
		}
	};

	// Pool specific
	ocp.worker.run = function(worker) {
		return function(event) {
			var task = event.data;
			worker.task_id = task.id;
			worker.task_name = task.name;
			if (task.name == 'set_name') {
				worker.thread_name = task.args;
				return;
			}
			worker.run(event);
		};
	};
})(ocp);
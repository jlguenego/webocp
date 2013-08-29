var console = null;

(function(ocp, undefined) {
	ocp.worker_utils = {};

	ocp.worker_utils.init = function() {

	};

	ocp.worker_utils.init_console = function(worker) {
		if (console == null) {
			console = function(msg) {
				worker.postMessage({
					console: msg,
					thread: worker.thread_name
					//task: worker.task_name,
				});
			}
		}
	};

	ocp.worker_utils.run = function(worker, func) {
		return function(event) {
			var task = event.data;
			if (task.name == 'set_name') {
				worker.thread_name = task.args;
				return;
			}
			func(event);
			worker.postMessage({
				finish: true
			});
		};
	};
})(ocp);

var console = ocp.worker_utils.console;
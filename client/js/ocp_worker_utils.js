var console = null;
var report = null;

(function(ocp, undefined) {
	ocp.worker_utils = {};

	ocp.worker_utils.init = function() {

	};

	ocp.worker_utils.init = function(worker) {
		if (console == null) {
			console = function(msg) {
				worker.postMessage({
					console: msg,
					thread: worker.thread_name,
					task_id: worker.task_id,
					task_name: worker.task_name
				});
			}
		}
		if (report == null) {
			report = function(obj) {
				worker.postMessage(obj);
			}
		}
	};

	ocp.worker_utils.run = function(worker, func) {
		return function(event) {
			var task = event.data;
			worker.task_id = task.id;
			worker.task_name = task.name;
			if (task.name == 'set_name') {
				worker.thread_name = task.args;
				return;
			}
			var b_finish = func(event);
			if (b_finish) {
				worker.postMessage({
					finish: true
				});
			}
		};
	};
})(ocp);

var console = ocp.worker_utils.console;
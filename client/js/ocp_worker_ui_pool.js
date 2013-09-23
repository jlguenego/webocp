(function(ocp, undefined) {
	ocp.worker_ui.pool = {};

	ocp.worker_ui.pool.Pool = function(size, url) {
	    var self = this;
	    var c_i = 0;

		this.ask_for_termination = false;

	    // set some defaults
	    this.threadQueue = []; // threads waiting for a task
	    this.threadList = []; // all threads
	    this.taskQueue = []; // tasks waiting for execution
	    this.activeTaskQueue = {}; // tasks being executed
	    this.size = size; // number of thread
	    this.last_call = 0;
	    this.send_update_event = true;

	    this.sendUpdateEvent = function(force) {
	    	var now = new Date().getTime();
	    	if (!force) {
		    	if (!this.send_update_event) {
		    		return;
		    	}
		    	if (now - this.last_call < 200) {
		    		return;
		    	}
		    }
	    	this.last_call = now;
	    	var event = new CustomEvent('ocp.worker_ui.pool.Pool.update', { 'detail': { pool: this } });
			window.dispatchEvent(event);
			//console.log('sent ocp.worker_ui.pool.Pool.update ' + c_i);
			c_i++;
	    }

	    this.addTask = function(task) {
	    	if (this.ask_for_termination) {
	    		console.log('addTask ignored because termination asked.');
	    		return;
	    	}
	        if (self.threadQueue.length > 0) {
	            var thread = self.threadQueue.shift();
	            thread.run(task);
	        } else {
	            self.taskQueue.push(task);
	        }
	        this.sendUpdateEvent();
	    }

	    this.getTask = function(taskId) {
	    	if (!this.activeTaskQueue[taskId]) {
	    		throw 'Cannot retrieve task with id=' + taskId;
	    	}
			return this.activeTaskQueue[taskId];
	    }

	    this.addActiveTask = function(task) {
	    	this.activeTaskQueue[task.id] = task;
	    }

	    this.removeTask = function(taskId) {
	    	if (this.activeTaskQueue[taskId]) {
	    		delete this.activeTaskQueue[taskId];
	    	}
	    }

	    this.terminate = function(force) {
			this.ask_for_termination = true;
	    	if (force) {
				while (this.threadQueue.length > 0) {
					this.threadQueue.shift();
				}
				while (this.threadList.length > 0) {
					var thread = this.threadList.shift();
					delete this.activeTaskQueue[thread.task.id];
					thread.worker.terminate();
				}
				while (this.taskQueue.length > 0) {
					this.taskQueue.shift();
				}
	    	} else {
				if (this.taskQueue.length == 0) {
					while (this.threadQueue.length > 0) {
						var thread = this.threadQueue.shift();
						thread.worker.terminate();
					}
				}
	    	}
	    }

		for (var i = 0 ; i < this.size ; i++) {
        	var thread = new ocp.worker_ui.pool.Thread(self, url, i);
            self.threadQueue.push(thread);
            self.threadList.push(thread);
        }
	    this.sendUpdateEvent(true);
	}

	ocp.worker_ui.pool.Thread = function(pool, url, name) {
		var self = this;

		this.name = name;
		this.pool = pool;
		this.worker = new Worker(url);
		this.worker.postMessage({
			name: 'set_name',
			args: name
		});

		this.task = null;

		this.worker.onmessage = function(event) {
			if (event.data.console) {
				console.log('Thread[' + event.data.thread + ']-Task[' + event.data.task_name + '-' + event.data.task_id + ']: ');
				console.log(event.data.console);
				return;
			}
        	if (self.task.callback_func) {
				self.task.callback_func(event);
			}
        	if (event.data.finish) {
		        self.free();
		    }
	    };

		this.run = function(task) {
			this.task = task;

	        if (this.task != null) {
	        	this.task.thread = this;
	        	this.pool.addActiveTask(this.task);
	        	//console.log(this.task.getObject());
	        	this.worker.postMessage(this.task.getObject());
	        } else {
	        	this.free();
	        }
		};

	    this.free = function() {
	    	var taskID = this.task.id;
	    	this.pool.removeTask(taskID);
	    	this.task = null;
	        if (this.pool.taskQueue.length > 0) {
	            var task = this.pool.taskQueue.shift();
	            this.run(task);
	        } else {
	        	if (this.pool.ask_for_termination) {
		            this.worker.terminate();
		        } else {
		        	this.pool.threadQueue.push(this);
		        }
	        }
	        this.pool.sendUpdateEvent(true);
	    }
	}

	ocp.worker_ui.pool.Task = function(id, name, args, callback_func) {
		var self = this;

		this.id = id; // id should be unique
		this.name = name; // program name to be run by the worker
		this.args = args; // args to be given to the program
		this.callback_func = callback_func; // function to call when a message is received
		this.thread = null; // the thread used to execute this task.

	};

	ocp.worker_ui.pool.Task.prototype.sendMessage = function(message, args) {
		args = args || {};
		this.thread.worker.postMessage({
			id: this.id,
			name: this.name,
			message: message,
			args: args
		});
	};

	ocp.worker_ui.pool.Task.prototype.getObject = function() {
		return {
			id: this.id,
			name: this.name,
			args: this.args
		};
	};
})(ocp)
(function(ocp, undefined) {
	ocp.worker_pool = {};

	ocp.worker_pool.Pool = function(size, url) {
	    var self = this;

	    // set some defaults
	    this.threadQueue = []; // threads waiting for a task
	    this.taskQueue = []; // tasks waiting for execution
	    this.size = size; // number of thread

        for (var i = 0 ; i < this.size ; i++) {
            self.threadQueue.push(new ocp.worker_pool.Thread(self, i, url));
        }

	    this.addTask = function(task) {
	        if (self.threadQueue.length > 0) {
	            var thread = self.threadQueue.shift();
	            thread.run(task);
	        } else {
	            self.taskQueue.push(task);
	        }
	    }

	    this.freeThread = function(thread) {
	        if (self.taskQueue.length > 0) {
	            var task = self.taskQueue.shift();
	            thread.run(task);
	        } else {
	            self.threadQueue.push(thread);
	        }
	    }
	}

	ocp.worker_pool.Thread = function(pool, name, url) {
		var self = this;

		this.pool = pool;
		this.name = name;

		this.worker = new Worker(url);

		this.worker.postMessage({
			name: 'set_name',
			args: name
		});

		this.worker.addEventListener('message', callback, false);

		this.task = null;

		this.run = function(task) {
			this.task = task;

	        if (this.task != null) {
	            this.worker.postMessage(this.task.getObject());
	        } else {
	        	this.pool.freeThread(this);
	        }
		};

		function callback(event) {
			if (event.data.console) {
				console.log('Thread[' + event.data.thread + ']-Task[' + event.data.task_name + '-' + event.data.task_id + ']: ' + event.data.console);
				return;
			}
        	if (self.task.callback_func) {
				self.task.callback_func(event);
			}
        	if (event.data.finish) {
        		self.task = null;
		        self.pool.freeThread(self);
		    }
	    }
	}

	ocp.worker_pool.Task = function(id, name, args, callback_func) {
		this.id = id; // id should be unique
		this.name = name; // program name to be run by the worker
		this.args = args; // args to be given to the program
		this.callback_func = callback_func; // function to call when a message is received

		this.getObject = function() {
			return {
				id: id,
				name: name,
				args: args
			}
		};
	}
})(ocp)
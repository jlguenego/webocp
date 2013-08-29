(function(ocp, undefined) {
	ocp.worker = {};

	ocp.worker.Pool = function (size, url) {
	    var self = this;

	    // set some defaults
	    this.threadQueue = []; // threads waiting for a task
	    this.taskQueue = []; // tasks waiting for execution
	    this.size = size; // number of thread

	    this.init = function() {
	        for (var i = 0 ; i < this.size ; i++) {
	            self.threadQueue.push(new ocp.worker.Thread(self, i, url));
	        }
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

	ocp.worker.Thread = function(pool, name, url) {
		var self = this;

		this.pool = pool;
		this.name = name;

		this.worker = new Worker(url);
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
        	if (self.task.callback_func) {
				self.task.callback_func(event);
			}
        	if (event.data.finish) {
        		self.task = null;
		        self.pool.freeThread(self);
		    }
	    }
	}

	ocp.worker.Task = function(id, name, args, callback_func) {
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


	ocp.worker.getURL = function(filename) {
		var worker = $('<script/>');
		worker.attr('id', 'worker_1');
		worker.attr('type', 'text/js-worker');
		worker.html('importScripts(base_url + "/' + filename + '");');
		$('body').append(worker);

		var base_url = window.location.href.replace(/\\/g,'/').replace(/\/[^\/]*$/, '');
		var base_href = $('base').attr('href');
		if (!/^http:\/\//.test(base_href)) {
			base_url += base_href;
		}
		var array = ['var base_url = "' + base_url + '";' + $('#worker_1').html()];
		var blob = new Blob(array, {type: "text/javascript"});
		worker.remove();
		return window.URL.createObjectURL(blob);
	};
})(ocp)
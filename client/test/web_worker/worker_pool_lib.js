function Pool(size) {
    var self = this;

    // set some defaults
    this.taskQueue = [];
    this.threadQueue = [];
    this.size = size;

    this.addTask = function(task) {
        if (self.threadQueue.length > 0) {
            var thread = self.threadQueue.shift();
            thread.run(task);
        } else {
            self.taskQueue.push(task);
        }
    }

    this.init = function() {
        for (var i = 0 ; i < this.size ; i++) {
            self.threadQueue.push(new Thread(self, i));
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

function Thread(pool, name) {
	var self = this;

	this.pool = pool;
	this.task = {};
	this.name = name;

	this.run = function(task) {
		this.task = task;
        //console.log('thread[' + this.name + '] starting new task[' + this.task.name + '].');

        if (this.task.script!= null) {
            var worker = new Worker(task.script);
            worker.addEventListener('message', callback, false);
            worker.postMessage(task.msg);
        } else {
        	this.pool.freeThread(this);
        }

        function callback(event) {
			self.task.callback(event);
        	if (event.data.finish) {
        		//console.log('thread[' + self.name + '] finished task[' + self.task.name + '].');
		        self.pool.freeThread(self);
		    }
	    }
	};
}

function Task(script, callback, msg, name) {
	this.script = script;
	this.callback = callback;
	this.msg = msg;
	this.name = name;
}
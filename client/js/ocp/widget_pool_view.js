/*!
 * jQuery UI Progressbar
 *
 *
 * Depends:
 *   jquery.ui.core.js
 *   jquery.ui.widget.js
 */
(function( $, undefined ) {

$.widget( "ui.ocp_pool_view", {
	version: "0.0.1",
	options: {
		// Action
		// Callback
	},

	treadQueue: null,
	taskQueue: null,
	activeTask: null,

	pool: null,

	_create: function() {
		this.element.addClass('ocp_pool_viewer');

		this.treadQueue = $('<div/>').appendTo(this.element);
		this.treadQueue.addClass('ocp_pv_line ocp_pv_tread_queue');
		var treadQueue_title = $('<div/>').html('Thread queue');
		treadQueue_title.addClass('title');
		this.treadQueue.append(treadQueue_title);
		var treadQueue_blocks = $('<div/>');
		treadQueue_blocks.addClass('blocks');
		this.treadQueue.append(treadQueue_blocks);

		this.taskQueue = $('<div/>').appendTo(this.element);
		this.taskQueue.addClass('ocp_pv_line ocp_pv_task_queue');
		var taskQueue_title = $('<div/>').html('Task queue');
		taskQueue_title.addClass('title');
		this.taskQueue.append(taskQueue_title);
		var taskQueue_blocks = $('<div/>');
		taskQueue_blocks.addClass('blocks');
		this.taskQueue.append(taskQueue_blocks);

		this.activeTask = $('<div/>').appendTo(this.element);
		this.activeTask.addClass('ocp_pv_line ocp_pv_active_tread');
		var activeThread_title = $('<div/>').html('Active tasks');
		activeThread_title.addClass('title');
		this.activeTask.append(activeThread_title);
		var activeThread_blocks = $('<div/>');
		activeThread_blocks.addClass('blocks');
		this.activeTask.append(activeThread_blocks);

		var self = this;
		window.addEventListener('ocp.worker_pool.Pool.update', function(e) {
			if (e.detail.pool == self.pool) {
				self.refresh();
			}
		}, false);
	},

	_destroy: function() {
	},

	attach: function(pool) {
		this.pool = pool;
		for (var i = 0; i < pool.threadQueue.length; i++) {
			this.add_queued_thread(pool.threadQueue[i]);
		}
		for (var i = 0; i < pool.taskQueue.length; i++) {
			this.add_queued_task(pool.taskQueue[i]);
		}
		for (var task_id in pool.activeTaskQueue) {
			var task = pool.activeTaskQueue[task_id];
			this.add_active_task(pool.activeTaskQueue[task_id]);
		}
	},

	add_queued_thread: function(thread) {
		var thread_block = $('<div/>');
		thread_block.addClass('block ocp_pv_tread_block');
		thread_block.html(thread.name);
		thread_block.appendTo(this.treadQueue.find('.blocks'));
	},

	add_queued_task: function(task) {
		var task_block = $('<div/>');
		task_block.addClass('block ocp_pv_task_block');
		task_block.html(task.id + '-' + task.name);
		task_block.attr('data-id', task.id);
		task_block.appendTo(this.taskQueue.find('.blocks'));
	},

	add_active_task: function(task) {
		var active_task_block = $('<div/>');
		active_task_block.addClass('block ocp_pv_active_task_block');
		active_task_block.html('[' + task.thread.name + '] ' + task.id + '-' + task.name);
		active_task_block.attr('data-id', task.id);
		active_task_block.appendTo(this.activeTask.find('.blocks'));
	},

	refresh: function() {
		if (!this.pool) {
			return;
		}

		this.treadQueue.find('.blocks').html('');
		this.taskQueue.find('.blocks').html('');
		this.activeTask.find('.blocks').html('');
		this.attach(this.pool);
	}
});

})( jQuery );
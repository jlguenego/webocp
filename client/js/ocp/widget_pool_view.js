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

	table: null,
	threadQueue: null,
	taskQueue: null,
	activeTask: null,

	pool: null,

	_create: function() {
		this.element.addClass('ocp_pool_viewer');
		this.table = $('<table/>').appendTo(this.element);

		this.threadQueue = $('<tr/>').appendTo(this.table);
		this.threadQueue.addClass('ocp_pv_line ocp_pv_thread_queue');
		var threadQueue_title = $('<td/>').html('Thread queue:');
		threadQueue_title.addClass('title');
		this.threadQueue.append(threadQueue_title);
		var threadQueue_blocks = $('<td/>');
		threadQueue_blocks.addClass('blocks');
		this.threadQueue.append(threadQueue_blocks);

		this.activeTask = $('<tr/>').appendTo(this.table);
		this.activeTask.addClass('ocp_pv_line ocp_pv_active_thread');
		var activeThread_title = $('<td/>').html('Active tasks:');
		activeThread_title.addClass('title');
		this.activeTask.append(activeThread_title);
		var activeThread_blocks = $('<td/>');
		activeThread_blocks.addClass('blocks');
		this.activeTask.append(activeThread_blocks);

		this.taskQueue = $('<tr/>').appendTo(this.table);
		this.taskQueue.addClass('ocp_pv_line ocp_pv_task_queue');
		var taskQueue_title = $('<td/>').html('Task queue:');
		taskQueue_title.addClass('title');
		this.taskQueue.append(taskQueue_title);
		var taskQueue_blocks = $('<td/>');
		taskQueue_blocks.addClass('blocks');
		this.taskQueue.append(taskQueue_blocks);

		var self = this;
		window.addEventListener('ocp.worker_ui.pool.Pool.update', function(e) {
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
		thread_block.addClass('block ocp_pv_thread_block');
		thread_block.html(thread.name);
		thread_block.appendTo(this.threadQueue.find('.blocks'));
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
		active_task_block.html(task.id + '-' + task.name);

		var thread_block = $('<div/>');
		thread_block.addClass('block ocp_pv_thread_block');
		thread_block.html(task.thread.name);
		thread_block.prependTo(active_task_block);

		active_task_block.attr('data-id', task.id);
		active_task_block.appendTo(this.activeTask.find('.blocks'));
	},

	refresh: function() {
		if (!this.pool) {
			return;
		}

		this.threadQueue.find('.blocks').html('');
		this.taskQueue.find('.blocks').html('');
		this.activeTask.find('.blocks').html('');
		this.attach(this.pool);
	}
});

})( jQuery );
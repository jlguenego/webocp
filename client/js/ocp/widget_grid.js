/*!
 * jQuery UI Grid
 *
 *
 * Depends:
 *   ocp.core.js
 *   jquery.ui.widget.js
 */

"use strict";

(function( $, undefined ) {

$.widget( "ui.ocp_grid", {
	version: "0.0.1",
	options: {
		id: 'my_grid',
		column: {},
		data: [],
		column_width: 50
	},
	counter: 0,
	swap_column_start_colname: null,
	swap_column_end_colname: null,

	scrollbar_width: null,

	container: null,
	header: null,
	body: null,

	_create: function() {
		this.scrollbar_width = $().getScrollbarWidth();

		this.container = $('<div class="widget_grid_container"/>').appendTo(this.element);
		this._header();
		this._body();

		// Set rows width.
		var self = this;
		$(window).resize(function() {
			self._refresh();
		});
		this._refresh();
		return this;
	},

	_destroy: function() {
	},

	_header: function() {
		this.header = $('<ul/>').appendTo(this.container);
		this.header.addClass('widget_grid_header_row');
		this.header.addClass('widget_grid_sortable');

		for (var name in this.options.column) {
			var column = this.options.column[name]
			var label = column.label || name;

			var cell = $('<li/>').appendTo(this.header);
			cell.addClass('widget_grid_cell');
			cell.addClass('widget_grid_header_cell');
			cell.attr('id', this.options.id + '_' + name); // For column swapping
			cell.attr('data-colname', this.options.id + '_' + name);
			cell.html(label);

			var width = column.width || this.options.column_width;
			cell.width(width);

			this._set_resizable_row(cell);
		}

		this._swap_column(this.header);

		// Make header snap to top.
		var self = this;
		this.container.scroll(function(){
		    self.header.css({
		        'top': $(this).scrollTop()
		    });
		});
	},


	_body: function() {
		this.body = $('<div class="widget_grid_body"/>').appendTo(this.container);

		// Header is absolute => show the first line of the grid.
		this.body.css('padding-top', this.header.height()+'px');
		this.body.css('box-sizing', 'border-box');

		for(var i = 0; i < this.options.data.length; i++) {
			var data = this.options.data[i];
			this.add_row(data);
		}
	},

	add_row: function(data) {
		var id = "widget_grid_row_" + this.counter;
		this.counter++;

		var row = $('<div/>').appendTo(this.body);
		row.addClass('widget_grid_body_row');
		row.attr('id', id);

		for (var colname in this.options.column) {
			var content = data[colname];
			var cell = $('<div/>').appendTo(row);
			cell.addClass('widget_grid_cell');
			cell.attr('data-colname', this.options.id + '_' + colname);
			cell.html(content);

			var width = this.header.find('[data-colname=' + this.options.id + '_' + colname + ']').width();
			cell.width(width);
		}
	},

	resize_col: function(col) {
		var colname = $(col).attr('data-colname');
		var width = $(col).width();
		this.body.find('[data-colname=' + colname + ']').width(width);
		this._refresh();
	},

	_refresh: function() {
		console.log('grid refresh');
		var row_w = this._total_cell_width();
		console.log('row_w=' + row_w);

		var container_w = this.container.width();
		if (this.container.hasVerticalScrollBar()) {
			container_w -= this.scrollbar_width;
		}

		console.log('container_w=' + container_w);
		if (row_w < container_w) {
			row_w = container_w;
		}

		this.header.outerWidth(row_w);
		this.body.outerWidth(row_w);
		this.body.find('.widget_grid_body_row').outerWidth(row_w);
	},

	_total_cell_width: function() {
		var result = 0;
		for (var colname in this.options.column) {
			var width = this.header.find('[data-colname=' + this.options.id + '_' + colname + ']').outerWidth();
			result += width;
		}
		return result;
	},

	_set_resizable_row: function(cell) {
		var self = this;
		cell.resizable({
			helper: "ui-resizable-helper",
			handles: 'e',
			minWidth: 20,
			start: function( event, ui ) {
				var helper = ui.helper;
				helper.height(helper.height() + 1);
			},
			stop: function( event, ui ) {
				self.resize_col(this);
			}
		});
	},

	_swap_column: function(header) {
		var self = this;
		header.sortable({
			containment: "parent",
			helper: "clone",
			placeholder: 'widget_grid_placeholder',
			forcePlaceholderSize: true,
			start: function(ev, ui) {
				ui.placeholder.outerHeight(ui.item.outerHeight());
				$(this).height(ui.placeholder.outerHeight());
				self.swap_column_start_colname = $(this).sortable("toArray").slice(-1)[0];
			},
			sort: function(ev, ui) {
				$(this).find('.ui-sortable-helper').css('top', '0px');
			},
			stop: function(ev, ui) {
				var a = $(this).sortable("toArray");
				self.swap_column_end_colname = null;
				var index = a.indexOf(self.swap_column_start_colname);
				if (index > 0) {
					self.swap_column_end_colname = a[index - 1];
				}

				self.body.find('.widget_grid_body_row').each(function() {
					var col_to_move = $(this).find('[data-colname=' + self.swap_column_start_colname + ']').detach();
					if (self.swap_column_end_colname) {
						col_to_move.insertAfter($(this).find('[data-colname=' + self.swap_column_end_colname + ']'));
					} else {
						col_to_move.prependTo($(this));
					}
				})
			}
		});
		header.disableSelection();
	}
});

})( jQuery );
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
		column_width: 50,
		prevent_dblclick: false,
		state: {},

		// Callback
		row_dblclick: function(e) { console.log('row_dblclick'); }
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
		if (this.options.prevent_dblclick) {
			this.element.dblclickPreventDefault();
		}
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
		this.body.css('-moz-box-sizing', 'border-box');

		for(var i = 0; i < this.options.data.length; i++) {
			var data = this.options.data[i];
			var row = this.add_row(data, i);
			if (is_even(i)) {
				row.addClass('widget_grid_body_row_even');
			}
		}
	},

	add_row: function(data, index) {
		var id = "widget_grid_row_" + this.counter;
		this.counter++;

		var row = $('<div/>').appendTo(this.body);
		row.addClass('widget_grid_body_row');
		row.attr('id', id);
		row.attr('data-rowid', index);

		for (var colname in this.options.column) {
			var cell = $('<div/>').appendTo(row);
			cell.addClass('widget_grid_cell');
			cell.attr('data-colname', this.options.id + '_' + colname);
			var content = data[colname];
			cell.html(content);

			if (this.options.column[colname].use_thumbnail) {
				var img = $('<div/>');
				img.addClass('widget_grid_thumbnail');

				// This code may be deported in a anonymous function
				if (data.meta_data) {
					img.addClass('widget_grid_type_' + data.meta_data.type);
					var type = '';
					var ext = data[colname].getFileExtention();
					if (data.meta_data.mime_type) {
						type = 'mime_' + data.meta_data.mime_type;
						type = type.replace('/', '_');
					} else if (ext) {
						type = 'ext_' + ext;
					}
					img.addClass('widget_grid_' + type);
				}

				cell.prepend(img);
			}

			var width = this.header.find('[data-colname=' + this.options.id + '_' + colname + ']').width();
			cell.width(width);
		}

		var self = this;
		row.click(function(e) {
			self.row_toggle_select($(this));
			console.log(self.options.data);
		});

		row.dblclick(function(e) {
			self.options.row_dblclick(e);
		});

		row.hover(function(e) {
			if (!$(this).hasClass('ocp_gd_selected')) {
				$(this).addClass('ocp_gd_row_hover');
			}
		}, function(e) {
			$(this).removeClass('ocp_gd_row_hover');
		});

		return row;
	},

	row_toggle_select: function(row) {
		if (!this.is_selected(row)) {
			this.row_select(row);
		} else {
			this.row_deselect(row);
		}
	},

	is_selected: function(row) {
		return row.hasClass('ocp_gd_selected');
	},

	row_select: function(row) {
		$('.ocp_gd_selected').removeClass('ocp_gd_selected');
		row.addClass('ocp_gd_selected');
	},

	row_deselect: function(row) {
		$('.ocp_gd_selected').removeClass('ocp_gd_selected');
	},

	resize_col: function(col) {
		var colname = $(col).attr('data-colname');
		var width = $(col).width();
		this.body.find('[data-colname=' + colname + ']').width(width);
		this._refresh();
	},

	_refresh: function() {
		var row_w = this._total_cell_width();

		var container_w = this.container.width();
		if (this.container.hasVerticalScrollBar()) {
			container_w -= this.scrollbar_width;
		}

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
	},

	reload: function(data) {
		this.body.remove();
		this.options.data = data.rows;
		this._body();
		this.options.state = data.state;
	}
});

})( jQuery );
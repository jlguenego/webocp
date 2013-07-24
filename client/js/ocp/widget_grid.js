/*!
 * jQuery UI Grid
 *
 *
 * Depends:
 *   jquery.ui.core.js
 *   jquery.ui.widget.js
 */


var g_scrollbar_offset = null;

(function( $, undefined ) {

$.widget( "ui.ocp_grid", {
	version: "0.0.1",
	options: {
		column: [],
		data: [],
		column_width: 50
	},
	counter: 0,
	start_colname: null,
	end_colname: null,

	_create: function() {
		g_scrollbar_offset = this.get_scrollbar_width();

		var container = $('<div class="widget_grid_container"/>').appendTo(this.element);
		this._header();
		var body = $('<div class="widget_grid_body"/>').appendTo(container);

		// Header is absolute => show the first line of the grid.
		body.css('padding-top', container.find('.widget_grid_header_row').height()+'px')
		this._rows();

		// Set rows width.
		this._resize_rows();
		return this;
	},

	_destroy: function() {
	},

	_header: function() {
		var container = this.element.find('.widget_grid_container');
		var header = $('<ul class="widget_grid_row widget_grid_header_row widget_grid_sortable"/>').appendTo(container);
		for (var name in this.options.column) {
			var cell = this.options.column[name]
			var label = cell.label || name;
			var cell_div = $('<li id="widget_grid_col_' + name + '" class="widget_grid_cell widget_grid_header_cell">' + label + '</li>')
							.appendTo(header);
			var width = cell.width || this.options.column_width;
			cell_div.width(width);
			this._set_resizable_row(cell_div);
		}

		this._set_sortable_header(header);

		// Make header snap to top.
		container.scroll(function(){
		    header.css({
		        'top': $(this).scrollTop()
		    });
		});
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

	_set_sortable_header: function(header) {
		var self = this;
		header.sortable({
			containment: "parent",
			helper: "clone",
			placeholder: 'widget_grid_placeholder',
			forcePlaceholderSize: true,
			start: function(ev, ui) {
				ui.placeholder.outerHeight(ui.item.outerHeight());
				$(this).height(ui.placeholder.outerHeight());
				self.start_colname = $(this).sortable("toArray").slice(-1)[0];
			},
			sort: function(ev, ui) {
				$(this).find('.ui-sortable-helper').css('top', '0px');
			},
			stop: function(ev, ui) {
				var a = $(this).sortable("toArray");
				self.end_colname = null;
				var index = a.indexOf(self.start_colname);
				if (index > 0) {
					self.end_colname = a[index - 1];
				}

				$(this).parent().find('.widget_grid_body_row').each(function() {
					var col_to_move = $(this).find('.' + self.start_colname).detach();
					if (self.end_colname) {
						col_to_move.insertAfter($(this).find('.' + self.end_colname));
					} else {
						col_to_move.prependTo($(this));
					}
				})
			}
		});
		header.disableSelection();
	},

	_rows: function() {
		for(var i = 0; i < this.options.data.length; i++) {
			var data = this.options.data[i];
			this.add_row(data);
		}
	},

	add_row: function(data) {
		var id = "widget_grid_row_" + this.counter;
		var row = $('<div id="' + id + '" class="widget_grid_row widget_grid_body_row"/>').appendTo(this.element.find('.widget_grid_body'));

		for (var colname in this.options.column) {
			var content = data[colname];
			var cell_div = $('<div class="widget_grid_cell widget_grid_col_' + colname + '">' + content + '</div>')
						.appendTo(row);
			var width = $('#widget_grid_col_' + colname).width();
			cell_div.width(width);
		}
		this.counter++;
	},

	resize_col: function(col) {
		var colname = $(col).attr('id');
		var width = $(col).width();
		$('.' + colname).width(width);
		this._resize_rows();
	},

	_resize_rows: function() {
		var row_w = this._total_row_width();
		var container_w = this.element.find('.widget_grid_container').innerWidth();
		if (row_w < container_w - g_scrollbar_offset) {
			row_w = container_w - g_scrollbar_offset;
		}

		var row = this.element.find('.widget_grid_row');
		var body = this.element.find('.widget_grid_body').get(0);
		if (body.scrollHeight > ($(body).outerHeight())) {
			console.log('has scroll');
			$(body).outerWidth(container_w - g_scrollbar_offset);
			row.outerWidth(row_w);
		} else {
			console.log('has not scroll');
			$(body).outerWidth(container_w);
			row.outerWidth(row_w + g_scrollbar_offset);
		}
	},

	_total_row_width: function() {
		var total_width = 0;
		for (var colname in this.options.column) {
			var width = $('#widget_grid_col_' + colname).outerWidth();
			total_width += width;
		}
		return total_width;
	},

	get_scrollbar_width: function() {
		// Find the Width of the Scrollbar
		var div = $('<div id="get_scrollbar_width_1" style="width:50px;height:50px;overflow-y:scroll;position:absolute;top:-200px;left:-200px;"><div id="get_scrollbar_width_2" style="height:100px;width:100%"></div></div>');
		div.appendTo($('body'));
		var w1 = $("#get_scrollbar_width_1").width();
		var w2 = $("#get_scrollbar_width_2").innerWidth();
		div.remove(); // remove the html from your document
		return w1 - w2;
	}
});

})( jQuery );
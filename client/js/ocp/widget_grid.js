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

	_create: function() {
		g_scrollbar_offset = this.get_scrollbar_width();

		var container = $('<div class="widget_grid_container"/>').appendTo(this.element);
		this._header();
		var body = $('<div class="widget_grid_body"/>').appendTo(container);
		body.css('padding-top', container.find('.widget_grid_header_row').height()+'px')
		this._rows();
		this._resize_rows();
		return this;
	},

	_destroy: function() {
	},

	_header: function() {
		var container = this.element.find('.widget_grid_container');
		var header = $('<div class="widget_grid_row widget_grid_header_row"/>').appendTo(container);
		for (var name in this.options.column) {
			var cell = this.options.column[name]
			var label = cell.label || name;
			var cell_div = $('<div id="widget_grid_col_' + name + '" class="widget_grid_cell widget_grid_header_cell">' + label + '</div>')
							.appendTo(header);
			var width = cell.width || this.options.column_width;
			cell_div.width(width);

			var self = this;
			cell_div.resizable({
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
		}
		container.scroll(function(){
		    header.css({
		        'top': $(this).scrollTop()
		    });
		});
	},

	_rows: function() {
		for(var i = 0; i < this.options.data.length; i++) {
			var data = this.options.data[i];
			this.add_row(data);
		}
	},

	add_row: function(data) {
		var id = "widget_grid_row_" + Math.round(new Date().getTime() / 1000);
		var row = $('<div id="' + id + '" class="widget_grid_row"/>').appendTo(this.element.find('.widget_grid_body'));

		for (var colname in this.options.column) {
			var content = data[colname];
			var cell_div = $('<div class="widget_grid_cell widget_grid_cell_' + colname + '">' + content + '</div>')
						.appendTo(row);
			var width = $('#widget_grid_col_' + colname).width();
			cell_div.width(width);
		}
	},

	resize_col: function(col) {
		var id = $(col).attr('id');
		var colname = $(col).attr('id').replace('widget_grid_col_', '');
		console.log('resizing ' + colname);
		var width = $(col).width();
		$('.widget_grid_cell_' + colname).width(width);
		this._resize_rows();
	},

	_resize_rows: function() {
		var row_w = this._total_row_width();
		var container_w = this.element.find('.widget_grid_container').innerWidth();
		if (row_w < container_w - g_scrollbar_offset) {
			row_w = container_w - g_scrollbar_offset;
			this.element.find('.widget_grid_cell:last-child').removeClass('widget_grid_cell_last');
		} else {
			this.element.find('.widget_grid_cell:last-child').addClass('widget_grid_cell_last');
		}

		this.element.find('.widget_grid_row').outerWidth(row_w);
		this.element.find('.widget_grid_body').outerWidth(container_w - g_scrollbar_offset);
	},

	_total_row_width: function() {
		var total_width = 0;
		for (var colname in this.options.column) {
			var width = $('#widget_grid_col_' + colname).width();
			total_width += width + 1; // border width
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
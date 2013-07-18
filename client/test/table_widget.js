/*!
 * jQuery UI Tree
 *
 *
 * Depends:
 *   jquery.ui.core.js
 *   jquery.ui.widget.js
 */
(function( $, undefined ) {

$.widget( "ui.ocp_table", {
	version: "0.0.1",
	options: {
		header: [],
		source: [],
		col_width: 100,
	},

	_create: function() {
		console.log(this.element);
		var table = $('<table class="table_content"/>').appendTo(this.element);
		this._header(table);
		this._fill(table);
	},

	_destroy: function() {
	},

	_header: function(el) {
		var colgroup = $('<colgroup/>').appendTo(el);
		var header = $('<tr class="table_header"/>').appendTo(el);
		for (var i = 0; i < this.options.header.length; i++) {
			var col = this.options.header[i];
			var cell = $('<th class="table_header_cell">' + col.label + '</th>').appendTo(header);
			var width = col.width || this.options.col_width;
			$('<col/>').width(width).appendTo(colgroup);
			cell.resizable({
				handles: "e"
			});
		}
	},

	_fill: function(el) {
		console.log(this.options.source);
		for (var i = 0; i < this.options.source.length; i++) {
			console.log(this.options.source[i]);
			this._add_row(el, this.options.source[i]);
		}
	},

	_add_row: function(el, src) {
		var row = $('<tr class="table_row"/>').appendTo(el);
		for (var i = 0; i < src.length; i++) {
			row.append('<td class="table_cell">' + src[i] + '</td>');
		}
	}
});

})( jQuery );
/*!
 * jQuery UI Tree
 *
 *
 * Depends:
 *   jquery.ui.core.js
 *   jquery.ui.widget.js
 */
(function( $, undefined ) {

$.widget( "ui.ocp_tree", {
	version: "0.0.1",
	options: {
		source: []
	},

	_create: function() {
		this._fill(this.element, this.options.source);
		return this;
	},

	_destroy: function() {
	},

	_fill: function(el, src) {
		var ul = $('<ul/>').appendTo(el);
		for (var i = 0; i < src.length; i++) {
			var item = src[i];
			var li = $('<li>' + item.item.label + '</li>').appendTo(ul);
			if (item.children) {
				this._fill(li, item.children);
			}
		}
	}
});

})( jQuery );
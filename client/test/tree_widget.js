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
		this._fill(this.element, this.options.source, 0);
		return this;
	},

	_destroy: function() {
	},

	_fill: function(el, src, level) {
		var ul = $('<div class="tree_struct"/>').appendTo(el);
		for (var i = 0; i < src.length; i++) {
			console.log('coucou ' + level);
			var item = src[i];
			var li = $('<div/>').appendTo(ul);
			var row = $('<div class="tree_row"/>').appendTo(li);
			for(var j = 0; j < level + 1; j++) {
				row.append('<img src="image/elbow.png"/>');
			}

			row.append('<div class="tree_text">' + level + ' ' + item.item.label + '</div>');
			if (item.children && item.children.length > 0) {
				this._fill(li, item.children, level + 1);
			}
		}
	}
});

})( jQuery );
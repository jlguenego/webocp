/*!
 * jQuery UI Tree
 *
 *
 * Depends:
 *   jquery.ui.core.js
 *   jquery.ui.widget.js
 */
require_once_css(ocp.dir + '/theme/' + ocp.css.theme + '/widget_tree.css');

(function( $, undefined ) {

$.widget( "ui.ocp_tree", {
	version: "0.0.1",
	options: {
		source: [],
		image: 'image/folder_new.gif',

		// Callback
		click: null
	},

	_create: function() {
		this.element.css('cursor', 'pointer');
		this._fill(this.element, this.options.source, 0, [ false ]);

		this._on( $('.tree_toggle'), {
			click: "toggle"
		});

        this._on( $('.tree_item'), {
			click: this.options.click || '',
			dblclick : "toggle"
        });

		var self = this;
		$('.tree_toggle').each(function() {
			self.toggle({ currentTarget: this});
		});
		return this;
	},

	_destroy: function() {
	},

	_fill: function(el, src, level, last_array) {
		var ul = $('<div class="tree_struct"/>').appendTo(el);
		for (var i = 0; i < src.length; i++) {
			if (i == src.length - 1) {
				last_array[level]	= true;
			}
			var item = src[i];
			var li = $('<div/>').appendTo(ul);
			var row = $('<div class="tree_row"/>').appendTo(li);
			for (var j = 0; j < level; j++) {
				if (last_array[j]) {
					row.append('<img src="image/elbow-blank.png"/>');
				} else {
					row.append('<img src="image/elbow-line.png"/>');
				}
			}
			if (item.children && item.children.length > 0) {
				if (i == src.length - 1) {
					row.append('<img class="tree_toggle" src="image/elbow-end-minus.png"/>');
				} else {
					row.append('<img class="tree_toggle" src="image/elbow-minus.png"/>');
				}
			} else {
				if (i == src.length - 1) {
					row.append('<img src="image/elbow-end.png"/>');
				} else {
					row.append('<img src="image/elbow.png"/>');
				}
			}
			var item_info = item.item.name;
			var div = $('<div class="tree_item" data-name="' + item_info + '"/>').appendTo(row);
			var image = item.item.image || this.options.image;
			if (image) {
				div.append('<img class="item_image" src="' + image + '"/>');
			}
			var label = item.item.label || item.item.name;
			div.append(label);
			if (item.children && item.children.length > 0) {

				var array = last_array.slice(0);
				array.push(false);
				this._fill(li, item.children, level + 1, array);
			}
		}
	},

	toggle: function(event) {
		var tree_struct = $(event.currentTarget).parent().parent().find('.tree_struct');
		tree_struct.toggle();
		var image_src = $(event.currentTarget).attr("src");
		if (image_src == "image/elbow-end-minus.png") {
			image_src = "image/elbow-end-plus.png";
		} else if (image_src == "image/elbow-minus.png") {
			image_src = "image/elbow-plus.png";
		} else if (image_src == "image/elbow-end-plus.png") {
			image_src = "image/elbow-end-minus.png";
		} else if (image_src == "image/elbow-plus.png") {
			image_src = "image/elbow-minus.png";
		}
		$(event.currentTarget).attr("src", image_src);
	}
});

})( jQuery );
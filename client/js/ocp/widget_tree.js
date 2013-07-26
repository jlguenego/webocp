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
		source: [],
		image: null,
		theme: '',

		// Callback
		click: function() {}
	},

	_create: function() {
		this.element.css('cursor', 'pointer');
		this._fill(this.element, this.options.source, 0, [ false ]);

		this._on( $('.tree_toggle', this.element), {
			click: "toggle"
		});

        this._on( $('.tree_item', this.element), {
			click: this.options.click,
			dblclick : "toggle"
        });


		var self = this;
		$('.tree_toggle', this.element).each(function() {
			var e = $.Event('click');
			e.currentTarget = this;
			self.toggle(e);
		});

		this._nodblclick_selection(this.element);
		return this;
	},

	_destroy: function() {
	},

	_fill: function(el, src, level, last_array, parent) {
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
					row.append('<div class="icon elbow-blank"/>');
				} else {
					row.append('<div class="icon elbow-line"/>');
				}
			}
			if (item.children && item.children.length > 0) {
				if (i == src.length - 1) {
					row.append('<div class="icon tree_toggle elbow-end-minus"/>');
				} else {
					row.append('<div class="icon tree_toggle elbow-minus"/>');
				}
			} else {
				if (i == src.length - 1) {
					row.append('<div class="icon elbow-end"/>');
				} else {
					row.append('<div class="icon elbow"/>');
				}
			}

			var image = item.item.image || this.options.image;
			var div = $('<div class="tree_item"/>').appendTo(row);
			var img_div = $('<div class="item_image icon"/>').appendTo(div);
			if (image) {
				img_div.css('background-image', 'url("'+image+'")');
			}

			var label = item.item.label || item.item.name;
			div.append(label);
			div.attr('data-name', item.item.name);
			div.attr('data-parent', parent);
			console.log('parent='+parent);

			if (item.children && item.children.length > 0) {
				var array = last_array.slice(0);
				array.push(false);
				this._fill(li, item.children, level + 1, array, item.item.name);
			}
		}
	},

	toggle: function(event) {
		event.preventDefault();
		var tree_struct = $(event.currentTarget).parent().parent().find('.tree_struct');
		tree_struct.toggle();
		var image_src = $(event.currentTarget);
		if (image_src.hasClass('elbow-end-minus')) {
			image_src.removeClass('elbow-end-minus').addClass('elbow-end-plus');
		} else if (image_src.hasClass('elbow-minus')) {
			image_src.removeClass('elbow-minus').addClass('elbow-plus');
		} else if (image_src.hasClass('elbow-end-plus')) {
			image_src.removeClass('elbow-end-plus').addClass('elbow-end-minus');
		} else if (image_src.hasClass('elbow-plus')) {
			image_src.removeClass('elbow-plus').addClass('elbow-minus');
		}
		$(event.currentTarget).attr("src", image_src);
	},

	mouse_down: false,
	click_counter: 0,

	_nodblclick_selection: function(item) {
		var self = this;
		item.mousedown(function(e) {
			self.mouse_down = true;
			self.click_counter++;
			setTimeout(function() {
				if (!self.mouse_down) {
					self.click_counter = 0;
				}
			}, 500);
			if (self.click_counter > 1) {
				e.preventDefault();
			}
		});

		item.mouseup(function(e) {
			self.mouse_down = false;
		});
	}
});

})( jQuery );
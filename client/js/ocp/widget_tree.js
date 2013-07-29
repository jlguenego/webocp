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

		// Action
		ls: function(path) {
			console.log('ls ' + path);
			return [
				{
					name: 'hello',
					label: 'Hello',
					type: 'dir'
				},
				{
					name: 'world',
					label: 'World',
					type: 'dir'
				}
			];
		},

		// Callback
		click: function() {}
	},

	_create: function() {
		this.element.css('cursor', 'pointer');
		this.paint();


		var self = this;
		this.element.dblclickPreventDefault();
		return this;
	},

	_destroy: function() {
	},

	paint: function() {
		this._fill(this.element, this.options.source, 0, [ false ], '');

		this._on( $('.tree_toggle', this.element), {
			click: "toggle"
		});

        this._on( $('.tree_item', this.element), {
			click: 'tree_item_click'
        });
	},

	_fill: function(el, src, level, last_array, path) {
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
					row.append('<div class="icon tree_toggle tree_minus tree_end"/>');
				} else {
					row.append('<div class="icon tree_toggle tree_minus"/>');
				}
			} else {
				if (i == src.length - 1) {
					row.append('<div class="icon elbow-end"/>');
				} else {
					row.append('<div class="icon elbow"/>');
				}
			}

			var image = item.image || this.options.image;
			var div = $('<div class="tree_item"/>').appendTo(row);
			var img_div = $('<div class="item_image icon"/>').appendTo(div);
			if (image) {
				img_div.css('background-image', 'url("'+image+'")');
			}

			var label = item.label || item.name;
			div.append(label);
			div.attr('data-name', item.name);
			var child_path = path;
			if (!child_path.endsWith('/')) {
				 child_path += '/';
			};
			child_path += item.name;
			div.attr('data-path', child_path);
			div.attr('data-level', level);

			if (item.children && item.children.length > 0) {
				var array = last_array.slice(0);
				array.push(false);
				this._fill(li, item.children, level + 1, array, child_path);
				if (!item.expanded) {
					var e = $.Event('click');
					e.currentTarget = row.children('.tree_toggle');
					this.toggle(e);
				}
			}
		}
	},

	toggle: function(event) {
		event.preventDefault();
		var currentTarget = $(event.currentTarget);
		var tree_struct = currentTarget.parent().parent().find('.tree_struct');
		var tree_item = currentTarget.parent().children('.tree_item');
		var path_a = tree_item.attr('data-path').split('/');
		path_a.shift();
		var src = this.get_subsrc_from_path(path_a, this.options.source);
		tree_struct.toggle();

		var image_src = currentTarget.parent().children('.tree_toggle');
		if (image_src.hasClass('tree_minus')) {
			image_src.removeClass('tree_minus').addClass('tree_plus');
			src.expanded = false;
		} else if (image_src.hasClass('tree_plus')) {
			image_src.removeClass('tree_plus').addClass('tree_minus');
			src.expanded = true;
		}
		$(event.currentTarget).attr("src", image_src);
	},

	ls: function(path) {
		if (this.options.ls) {
			return this.options.ls(path);
		} else {
			console.log('ls does not exist');
		}
	},

	tree_item_click: function(event) {
		var tree_item = $(event.currentTarget);
		var path = tree_item.attr('data-path');
		var level = tree_item.attr('data-level');
		var subdir_src = this.ls(path);

		var path_a = path.split('/');
		path_a.shift();
		this.options.source = this.src_merge(path_a, subdir_src, this.options.source);

		this.element.find('.tree_struct').remove();
		this.paint();
	},

	src_merge: function(path_a, subdir_src, src) {
		path_a = path_a.slice();
		console.log('path_a=' + path_a);
		if (path_a.length == 0) {
			return subdir_src;
		}

		var dirname = path_a.shift();
		var subsrc = this.get_subsrc(dirname, src);
		subsrc.children = this.src_merge(path_a, subdir_src, subsrc.children);
		subsrc.expanded = true;
		return src;
	},

	get_subsrc: function(dirname, src) {
		console.log('src=' + src);
		console.log(src);
		console.log('dirname=' + dirname);
		for (var i = 0; i < src.length; i++) {
			if (src[i].name == dirname) {
				return src[i];
			}
		}
		return null;
	},

	get_subsrc_from_path: function(path_a, children) {
		if (path_a.length == 1) {
			return this.get_subsrc(path_a[0], children);
		}
		var dirname = path_a.shift();

		return this.get_subsrc_from_path(path_a, this.get_subsrc(dirname, children).children);

	}
});

})( jQuery );
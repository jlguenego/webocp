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
		click: function() {},

		open_item_error: function(path) {
			alert('Cannot go to directory ' + path);
		}
	},

	_create: function() {
		this.paint();


		var self = this;
		this.element.dblclickPreventDefault();
		return this;
	},

	_destroy: function() {
	},

	paint: function() {
		this._fill(this.element, this.options.source, 0, [ false ], '');

		this._on( $('.ocp_wd_tree_toggle', this.element), {
			click: "toggle"
		});

        this._on( $('.ocp_wd_tree_item', this.element), {
			click: 'tree_item_click'
        });
	},

	_fill: function(el, src, level, last_array, path) {
		var ul = $('<div class="ocp_wd_tree_struct"/>').appendTo(el);
		for (var i = 0; i < src.length; i++) {
			if (i == src.length - 1) {
				last_array[level]	= true;
			}
			var item = src[i];
			var li = $('<div/>').appendTo(ul);
			var row = $('<div class="ocp_wd_tree_row"/>').appendTo(li);
			for (var j = 0; j < level; j++) {
				if (last_array[j]) {
					row.append('<div class="ocp_wd_tree_icon ocp_wd_tree_elbow-blank"/>');
				} else {
					row.append('<div class="ocp_wd_tree_icon ocp_wd_tree_elbow-line"/>');
				}
			}
			if (item.children && item.children.length > 0) {
				if (i == src.length - 1) {
					row.append('<div class="ocp_wd_tree_icon ocp_wd_tree_toggle ocp_wd_tree_minus ocp_wd_tree_end"/>');
				} else {
					row.append('<div class="ocp_wd_tree_icon ocp_wd_tree_toggle ocp_wd_tree_minus"/>');
				}
			} else {
				if (i == src.length - 1) {
					row.append('<div class="ocp_wd_tree_icon ocp_wd_tree_elbow-end"/>');
				} else {
					row.append('<div class="ocp_wd_tree_icon ocp_wd_tree_elbow"/>');
				}
			}

			var image = item.image || this.options.image;
			var div = $('<div class="ocp_wd_tree_item"/>').appendTo(row);
			var img_div = $('<div class="ocp_wd_tree_item_image ocp_wd_tree_icon"/>').appendTo(div);
			if (image) {
				img_div.css('background-image', 'url("' + image + '")');
			}

			var label = item.label || item.name;
			var div_label = $('<div/>').addClass('ocp_wd_tree_item_label');
			div_label.html(label);
			div.append(div_label);
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
					e.currentTarget = row.children('.ocp_wd_tree_toggle');
					this.toggle(e);
				}
			}
		}
	},

	toggle: function(event) {
		event.preventDefault();
		var currentTarget = $(event.currentTarget);
		var tree_struct = currentTarget.parent().parent().find('.ocp_wd_tree_struct');
		var tree_item = currentTarget.parent().children('.ocp_wd_tree_item');
		var path = tree_item.attr('data-path');
		if (path == '/') {
			path = '';
		}
		path_a = path.split('/');
		console.log('path_a=' + path_a);
		var src = this.get_subobj_from_path(path_a, this.options.source);
		tree_struct.toggle();

		var image_src = currentTarget.parent().children('.ocp_wd_tree_toggle');
		if (image_src.hasClass('ocp_wd_tree_minus')) {
			image_src.removeClass('ocp_wd_tree_minus').addClass('ocp_wd_tree_plus');
			src.expanded = false;
		} else if (image_src.hasClass('ocp_wd_tree_plus')) {
			image_src.removeClass('ocp_wd_tree_plus').addClass('ocp_wd_tree_minus');
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

		var path_temp = path;
		if (path_temp == '/') {
			path_temp = '';
		}
		var path_a = path_temp.split('/');
		var subobj = this.get_subobj_from_path(path_a, this.options.source);

		subobj.children = this.ls(path);
		subobj.expanded = true;
		this.element.find('.ocp_wd_tree_struct').remove();
		this.paint();
		$('.ocp_wd_tree_item[data-path="' + path + '"]').addClass('ocp_wd_tree_selected');
	},

	open_item: function(path) {
		var my_path = path;

		while (this.element.find('[data-path="' + my_path + '"]').length == 0) {
			my_path = ocp.dirname(my_path);
		}

		var my_path_a = my_path.split('/');

		var path_a = path.split('/');

		for (var i = my_path_a.length - 1; i < path_a.length; i++) {
			var p = path_a.slice(0, i + 1).join('/');
			if (p == '') {
				p = '/';
			}

			var e = $.Event('click');
			e.currentTarget = this.element.find('[data-path="' + p + '"]');
			if (e.currentTarget.length == 0) {
				this.options.open_item_error(path);
				return;
			}
			this.tree_item_click(e);
		}

	},

	get_subobj: function(dirname, dir_list) {
		for (var i = 0; i < dir_list.length; i++) {
			if (dir_list[i].name == dirname) {
				return dir_list[i];
			}
		}
		console.log('dir not found:' + dirname);
		return null;
	},

	get_subobj_from_path: function(path_a, children) {
		var subobj = this.get_subobj(path_a[0], children);
		if (path_a.length == 1) {
			return subobj;
		}
		path_a.shift();
		return this.get_subobj_from_path(path_a, subobj.children);
	}
});

})( jQuery );
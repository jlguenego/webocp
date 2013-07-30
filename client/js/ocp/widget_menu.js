/*!
 * jQuery UI Menu
 *
 *
 * Depends:
 *   ocp.core.js
 *   jquery.ui.widget.js
 */

"use strict";

(function( $, undefined ) {

$.widget( "ui.ocp_menu", {
	version: "0.0.1",
	options: {
		data_id: null,
	},

	menu_body: null,
	menu_transition: null,

	_create: function() {
		var data_id = this.options.data_id || this.element.attr('id') + '_data';
		this.menu_body = $('#' + data_id);
		this.menu_body.hide();

		console.log(this.element);

		this.element.addClass('widget_menu_root');
		this.menu_body.addClass('widget_menu_body');

		this.menu_transition = $('<div/>').outerWidth(this.element.outerWidth());
		this.menu_transition.addClass('widget_menu_transition');
		this.menu_transition.insertBefore(this.menu_body);
		this.menu_transition.append('<div class="widget_menu_arrow"/>');
		this.menu_transition.hide();


		var self = this;
		this.element.mouseover(function() {
			self._set_body_offset();
			self.menu_body.show();
			self.menu_transition.show();
		}).mouseout(function(e){
			self.menu_body.hide();
			self.menu_transition.hide();
		});

		this.menu_transition.mouseover(function() {
			self._set_body_offset();
			self.menu_body.show();
			self.menu_transition.show();
		}).mouseout(function(e){
			self.menu_body.hide();
			self.menu_transition.hide();
		});

		this.menu_body.mouseover(function() {
			self._set_body_offset();
			self.menu_body.show();
			self.menu_transition.show();
		}).mouseout(function(e){
			self.menu_body.hide();
			self.menu_transition.hide();
		});

		return this;
	},

	is_mouse_inside: function(el, e) {
		var offset = el.offset();
		offset.bottom = offset.top + el.outerHeight();
		offset.right = offset.left + el.outerWidth();
		console.log(offset);
		if (offset.top < e.pageY && e.pageY > offset.bottom) {
			return false;
		}
		if (offset.left < e.pageX && e.pageX > offset.right) {
			return false;
		}
		return true;
	},

	_destroy: function() {
	},

	_set_body_offset: function() {
		var offset = this.element.offset();
		offset.top = offset.top + this.element.outerHeight();

		var width = this.menu_body.outerWidth();
		var body_offset_right = offset.left + width;
		var window_w = this.element.parent().width();
		if (body_offset_right > window_w) {
			body_offset_right -= (body_offset_right - window_w);
			offset.left = body_offset_right - width;
		}

		this.menu_body.css({
			position: 'absolute',
			top: offset.top + 8,
			left: offset.left
		});

		this.menu_transition.css({
			position: 'absolute',
			top: offset.top - 5,
			left: this.element.offset().left
		});
	}
});

})( jQuery );
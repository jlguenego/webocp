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
		body_id: null,
	},

	menu_body: null,
	menu_transition: null,

	_create: function() {
		var body_id = this.options.body_id || this.element.attr('id') + '_body';
		this.menu_body = $('#' + body_id);
		this.menu_body.hide();

		this.element.addClass('widget_menu_root');
		this.menu_body.addClass('widget_menu_body');

		this.menu_transition = $('<div/>').outerWidth(this.element.outerWidth());
		this.menu_transition.addClass('widget_menu_transition');
		this.menu_transition.append('<div class="widget_menu_arrow"/>');
		this.menu_transition.hide();
		this.menu_transition.insertBefore(this.menu_body);

		var self = this;
		this.element.mouseover(function() {
			self._show_menu();
		}).mouseout(function(e){
			self._hide_menu();
		});

		this.menu_transition.mouseover(function() {
			self._show_menu();
		}).mouseout(function(e){
			self._hide_menu();
		});

		this.menu_body.mouseover(function() {
			self._show_menu();
		}).mouseout(function(e){
			self._hide_menu();
		});

		return this;
	},

	_destroy: function() {
	},

	_show_menu: function() {
		this._set_body_offset();
		this.menu_body.show();
		this.menu_transition.show();
	},

	_hide_menu: function() {
		this.menu_body.hide();
		this.menu_transition.hide();
	},

	_set_body_offset: function() {
		var menu_body_offset = this.element.offset();
		menu_body_offset.top = menu_body_offset.top + this.element.outerHeight();

		var width = this.menu_body.outerWidth();
		var body_offset_right = menu_body_offset.left + width;
		var window_w = this.element.parent().width();
		if (body_offset_right > window_w) {
			body_offset_right -= (body_offset_right - window_w);
			menu_body_offset.left = body_offset_right - width;
		}

		this.menu_body.css({
			position: 'absolute',
			top: menu_body_offset.top + 8,
			left: menu_body_offset.left
		});

		this.menu_transition.css({
			position: 'absolute',
			top: menu_body_offset.top - 5,
			left: this.element.offset().left
		});
	}
});

})( jQuery );
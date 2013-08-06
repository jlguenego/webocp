/*!
 * jQuery UI Dialog
 *
 *
 * Depends:
 *   ocp.core.js
 *   jquery.ui.widget.js
 */

"use strict";

(function( $, undefined ) {

$.widget( "ui.ocp_dialog", {
	version: "0.0.1",
	options: {
		width: null,
		height: null,

		buttons: {},

		// Callback
		close: function() {},
	},

	back_screen: null,
	content: null,

	_create: function() {
		if ($('.widget_dialog_back_screen').length < 1) {
			var back_screen = $('<div/>').appendTo('body');
			back_screen.addClass('widget_dialog_overlay');
		}
		this.back_screen = $('.widget_dialog_overlay');
		this.back_screen.hide();

		this.element.hide();
		this.element.addClass('widget_dialog_frame');
		this.element.css({
			width: this.options.width,
			height: this.options.height
		});

		this._set_dialog_content();

//		this.element.ocp_layout_3r({
//			header_h: 30,
//			footer_h: 40
//		});

		var self = this;
		$(window).resize(function() {
			self._center_dialog();
		});

		return this;
	},

	_destroy: function() {
	},

	_center_dialog: function() {
		var window_w = $(window).width();
		var window_h = $(window).height();

		var frame_w = this.element.outerWidth();
		var frame_h = this.element.outerHeight();

		var top = (window_h - frame_h) / 2;
		var left = (window_w - frame_w) / 2;

		this.element.css({
			top: top,
			left: left
		});
	},

	_set_dialog_content: function() {
		this.content = $('<div/>').html(this.element.html());
		this.content.addClass('widget_dialog_content');
		this.element.html(this.content);
		this._add_buttons();

		var header = $('<div/>').prependTo(this.element);
		header.addClass('widget_dialog_header');
		header.html(this.element.attr('title'));

		var close_btn = $('<div class="widget_dialog_close"/>').prependTo(header);
		var self = this;
		close_btn.click(function() {
			self.close();
		});

		this.element.removeAttr('title');

		this.element.draggable({
			handle: '.widget_dialog_header',
			containment: 'parent'
		});
	},

	_add_buttons: function() {
		var footer = $('<div/>').appendTo(this.element);
		footer.addClass('widget_dialog_footer');
		for (var name in this.options.buttons) {
			var button = $('<div/>').appendTo(footer);
			button.addClass('widget_dialog_button');
			button.html(name);

			button.click(this.options.buttons[name]);
		}
	},

	open: function() {
		this._center_dialog();
		this.back_screen.show();
		this.element.show();
		this.element.find('input').focus();
	},

	close: function() {
		this.back_screen.hide();
		this.element.hide();
		this.options.close();
	}
});

})( jQuery );
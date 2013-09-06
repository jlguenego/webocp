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

	overlay: null,
	content: null,

	_create: function() {
		if ($('.widget_dialog_overlay').length == 0) {
			var overlay = $('<div/>').appendTo('body');
			overlay.addClass('widget_dialog_overlay');
		}
		this.overlay = $('.widget_dialog_overlay');
		this.overlay.hide();

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

		var scroll

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

		var close_btn = $('<a href="#" class="widget_dialog_close"/>').prependTo(header);
		var self = this;
		close_btn.click(function(e) {
			e.preventDefault();
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
			var button = $('<a href="#"/>').appendTo(footer);
			button.addClass('widget_dialog_button');
			button.html(name);

			var self = this;
			button.click(function(e) {
				e.preventDefault();
				self.options.buttons[name]();
			});
		}
	},

	open: function() {
		this._center_dialog();
		this.overlay.show();
		this.element.show();
		this.element.find(':tabbable').eq(1).focus();

		var self = this;
		this.element.bind('keydown', function(e) {
			self._on_keydown(e, self);
		});
	},

	close: function() {
		this.overlay.hide();
		this.element.hide();
		this.element.unbind('keydown');
		this.options.close();
	},

	_on_keydown: function(e, self) {
		if ( e.keyCode !== $.ui.keyCode.TAB ) {
			return;
		}
		var tabbables = self.element.find(":tabbable");
		var first = tabbables.filter(":first");
		var last  = tabbables.filter(":last");

		if ( ( e.target === last[0] ) && !e.shiftKey ) {
			first.focus(1);
			e.preventDefault();
		} else if ( ( e.target === first[0] ) && e.shiftKey ) {
			last.focus(1);
			e.preventDefault();
		}
	}
});

})( jQuery );

function ocp_dialog_is_open() {
	return $('.widget_dialog_overlay').is(':visible');
}
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

$.widget( "ui.ocp_select", {
	version: "0.0.1",
	options: {
		max_width: null
	},

	container: null,
	selector_div: null,
	text_div: null,
	arrow_div: null,
	option_box_div: null,

	_create: function() {
		this.element.hide();

		this.container = $('<div/>').insertBefore(this.element);
		this.container.addClass('widget_select_container');
		this.container.dblclickPreventDefault();

		this.selector_div = $('<div/>').appendTo(this.container);
		this.selector_div.addClass('widget_select_selector');

		this.arrow_div = $('<div/>').appendTo(this.selector_div);
		this.arrow_div.addClass('widget_select_arrow');

		this.text_div = $('<div/>').appendTo(this.selector_div);
		this.text_div.addClass('widget_select_text');

		this.option_box_div = $('<div/>').appendTo(this.container);
		this.option_box_div.addClass('widget_select_option_box');

		var self = this;
		$(window).load(function() {
			self._set_content();
		});

		$(window).click(function(e) {
			if (e.target != self.text_div[0] && e.target != self.arrow_div[0]) {
				self.option_box_div.hide();
				return;
			}
			var options = self.element.find('option');
			if (options.length == 0) {
				self.option_box_div.hide();
				return;
			}
			self.option_box_div.toggle();
		});

		return this;
	},

	_destroy: function() {
	},

	_update_selector: function(current_selected) {
		this.text_div.html(current_selected.html());
		var value = current_selected.attr('data-value') || current_selected.val();

		this.element.val(value);
	},

	_set_content: function() {
		var options = this.element.find('option');

		for (var i = 0; i < options.length; i++) {
			var option = $('<div/>').appendTo(this.option_box_div);
			option.addClass('widget_select_option_line');
			option.html(options.eq(i).html());
			option.attr('data-value', options.eq(i).val());

			var self = this;
			option.click(function() {
				self._update_selector($(this));
			});
		}

		this.options.max_width = this.options.max_width || this.option_box_div.outerWidth(true);

		this.selector_div.outerWidth(this.options.max_width + 40); // 25 for the arrow on the right

		var current_selected = this.element.find(':selected').eq(0);
		this._update_selector(current_selected);

		this.option_box_div.hide();
	}
});

})( jQuery );
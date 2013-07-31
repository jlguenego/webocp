/*!
 * jQuery UI Layout 3R
 *
 *
 * Depends:
 *   jquery.ui.core.js
 *   jquery.ui.widget.js
 */


var g_scrollbar_offset = null;

(function( $, undefined ) {

$.widget( "ui.ocp_layout_3r", {
	version: "0.0.1",
	options: {
		header_h: 50,
		footer_h: 90
	},

	header: null,
	content: null,
	footer: null,

	_create: function() {
		this.header = $(this.element.find('>div').get(0));
		this.content = $(this.element.find('>div').get(1));
		this.footer = $(this.element.find('>div').get(2));

		this.header.outerHeight(this.options.header_h).width('100%');
		this.content.width('100%');
		this.footer.outerHeight(this.options.footer_h).width('100%');

		this.refresh();
		var self = this;
		$(window).resize(function() {
			self.refresh();
		});
		return this;
	},

	_destroy: function() {
	},

	refresh: function() {
		var window_h = this.element.height();
		var header_h = this.header.outerHeight();
		var footer_h = this.footer.outerHeight();
		this.content.height(window_h - header_h - footer_h);
	}
});

})( jQuery );
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

	_create: function() {
		var header = $(this.element.find('>div').get(0));
		var content = $(this.element.find('>div').get(1));
		var footer = $(this.element.find('>div').get(2));

		header.addClass('widget_layout_3r_header').height(this.options.header_h);
		content.addClass('widget_layout_3r_content');
		footer.addClass('widget_layout_3r_footer').height(this.options.footer_h);

		this.refresh();
		$(window).resize(this.refresh);
		return this;
	},

	_destroy: function() {
	},

	refresh: function() {
		var window_h = $(window).height();
		var header_h = $('.widget_layout_3r_header').height();
		var footer_h = $('.widget_layout_3r_footer').height();
		$('.widget_layout_3r_content').height(window_h - header_h - footer_h);
	}
});

})( jQuery );
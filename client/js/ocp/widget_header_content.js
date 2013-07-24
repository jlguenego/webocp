/*!
 * jQuery UI Header Content
 *
 *
 * Depends:
 *   jquery.ui.core.js
 *   jquery.ui.widget.js
 */


(function( $, undefined ) {

$.widget( "ui.ocp_header_content", {
	version: "0.0.1",
	options: {
	},

	_create: function() {
		var header = $(this.element.children().get(0));
		var content = $(this.element.children().get(1));
		content.outerHeight(this.element.innerHeight() - header.outerHeight());

		var self = this;
		$(window).resize(function() {
			content.outerHeight(self.element.innerHeight() - header.outerHeight());
		});

		return this;
	},

	_destroy: function() {
	}
});

})( jQuery );
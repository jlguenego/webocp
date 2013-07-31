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

	header: null,
	content: null,

	_create: function() {
		this.header = $(this.element.children().get(0));
		this.content = $(this.element.children().get(1));
		this.content.outerHeight(this.element.innerHeight() - this.header.outerHeight());

		var self = this;
		$(window).resize(function() {
			self.content.outerHeight(self.element.innerHeight() - self.header.outerHeight());
		});

		return this;
	},

	_destroy: function() {
	}
});

})( jQuery );
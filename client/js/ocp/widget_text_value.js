/*!
 * jQuery UI Header Content
 *
 *
 * Depends:
 *   jquery.ui.core.js
 *   jquery.ui.widget.js
 */


(function( $, undefined ) {

$.widget( "ui.ocp_text_value", {
	version: "0.0.1",
	options: {
	},

	header: null,
	content: null,

	_create: function() {
		this.header = $(this.element.children().get(0));
		this.content = $(this.element.children().get(1));
		this.content.outerWidth(this.element.width() - this.header.outerWidth());

		var self = this;
		$(window).resize(function() {
			self.content.outerWidth(self.element.width() - self.header.outerWidth());
		});

		return this;
	},

	_destroy: function() {
	}
});

})( jQuery );
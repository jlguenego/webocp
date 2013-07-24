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
		content.height(this.element.height() - header.height());

		var self = this;
		$(window).resize(function() {
			console.log('height=' + self.element.height());
			content.height(self.element.height() - header.height());
		});

		return this;
	},

	_destroy: function() {
	}
});

})( jQuery );
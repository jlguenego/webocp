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

	text: null,
	value: null,

	_create: function() {
		var self = this;
		console.log($(this.element));
		$(this.element).contents()
			.filter(function() {
				return this.nodeType == 3; //Node.TEXT_NODE
			}).remove();

		this.text = $(this.element.children().get(0)).css('display', 'inline-block');
		this.value = $(this.element.children().get(1)).css('display', 'inline-block');

		$(window).load(function() {
			self.value.outerWidth(self.element.width() - self.text.outerWidth());
		});

		$(window).resize(function() {
			self.value.outerWidth(self.element.width() - self.text.outerWidth());
		});

		return this;
	},

	_destroy: function() {
	}
});

})( jQuery );
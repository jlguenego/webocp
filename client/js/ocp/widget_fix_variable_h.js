/*!
 * jQuery UI Header Content
 *
 *
 * Depends:
 *   jquery.ui.core.js
 *   jquery.ui.widget.js
 */


(function( $, undefined ) {

$.widget( "ui.ocp_fix_variable_h", {
	version: "0.0.1",
	options: {
	},

	text: null,
	value: null,

	_create: function() {
		var self = this;
		this.element.css('white-space' , 'nowrap');
		this.element.contents()
			.filter(function() {
				return this.nodeType == 3; //Node.TEXT_NODE
			}).remove();

		var css = {
			display: 'inline-block',
			'vertical-align': 'top'
		};
		this.text = $(this.element.children().get(0)).css(css);
		this.value = $(this.element.children().get(1)).css(css);

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
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
		fix: null,
		variable: null
	},

	fix: null,
	variable: null,

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

		this.fix = this.options.fix || $(this.element.children().get(0));
		this.variable = this.options.variable || $(this.element.children().get(1));
		this.fix.css(css);
		this.variable.css(css);

		$(window).load(function() {
			self.variable.outerWidth(self.element.width() - self.fix.outerWidth());
		});

		$(window).resize(function() {
			self.variable.outerWidth(self.element.width() - self.fix.outerWidth());
		});

		return this;
	},

	_destroy: function() {
	}
});

})( jQuery );
/*!
 * jQuery UI Header Content
 *
 *
 * Depends:
 *   jquery.ui.core.js
 *   jquery.ui.widget.js
 */


(function( $, undefined ) {

$.widget( "ui.ocp_fix_variable", {
	version: "0.0.1",
	options: {
		fix: null,
		variable: null
	},

	fix: null,
	variable: null,

	_create: function() {
		this.fix = this.options.fix || $(this.element.children().get(0));
		this.variable = this.options.variable || $(this.element.children().get(1));
		this.resize();

		var self = this;
		$(window).resize(function() {
			self.resize();
		});

		return this;
	},

	_destroy: function() {
	},

	resize: function() {
		var expected_height = this.element.innerHeight() - this.fix.outerHeight();
		this.variable.outerHeight(expected_height);
	},

	set_variable: function(variable) {
		this.variable = variable;
		$(window).trigger('resize');
	},

	set_fix: function(fix) {
		this.fix = fix;
		$(window).trigger('resize');
	}
});

})( jQuery );
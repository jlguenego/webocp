/*!
 * jQuery UI Header Content
 *
 *
 * Depends:
 *   jquery.ui.core.js
 *   jquery.ui.widget.js
 */


(function( $, undefined ) {

var console = { log: function() {} };

$.widget( "ui.ocp_fix_variable_v", {
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
		console.log(this.variable);
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
		console.log('resizing ' + this.element.attr('id'));
		console.log('parent_size:  ' + this.element.innerHeight());
		console.log('fix_size:  ' + this.fix.outerHeight(true));
		var expected_height = this.element.innerHeight() - this.fix.outerHeight(true);
		var min_height = this.variable.css('min-height').replace(/[a-z]/g, '');
		expected_height = Math.max(expected_height, min_height);
		console.log('expected_height for ' + this.variable.attr('id') + '=' + expected_height);
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
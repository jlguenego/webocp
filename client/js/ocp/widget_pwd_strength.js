/*!
 * jQuery UI Password Strength
 *
 *
 * Depends:
 *   ocp.core.js
 *   jquery.ui.widget.js
 */

"use strict";

(function( $, undefined ) {

$.widget( "ui.ocp_pwd_strength", {
	version: "0.0.1",
	options: {
		strength_msg_a: ['', 'Weak', 'Fair', 'Strong', 'Exellent'],
		pwd_strength: function(pwd) {
			pwd = '' + pwd;
			var result = 0;

			if (pwd.match(/[A-Z]/)) {
				result++;
			}

			if (pwd.match(/[0-9]/)) {
				result++;
			}

			if (pwd.match(/[\W]/)) {
				result++;
			}

			if (pwd.length >= 6) {
				result++;
			}

			return result;
		}
	},

	strength_block: null,
	text_block: null,

	_create: function() {
		this.strength_block = $('<div/>').insertAfter(this.element);
		this.strength_block.addClass('widget_pwd_strength_block');
		for (var i = 0; i < 4; i++) {
			var line = $('<div/>').appendTo(this.strength_block);
			line.addClass('widget_pwd_strength_line');
			line.addClass('line' + (i + 1));
		}
		this.strength_block.append('<div class="widget_clear"/>');
		this.text_block = $('<div/>').appendTo(this.strength_block);
		this.text_block.addClass('widget_pwd_strength_txt');

		var self = this;
		this.element.keyup(function() {
			self._sync_strength();
		});
		return this;
	},

	_destroy: function() {
	},

	_sync_strength: function() {
		var pwd = this.element.find('input[type=password]').val();
		var strength = this.options.pwd_strength(pwd);
		var txt = this.options.strength_msg_a[strength];
		this.text_block.html(txt);
		var classname = 'good' + strength;
		this.strength_block.removeClass('good0 good1 good2 good3 good4').addClass(classname);
	}
});

})( jQuery );
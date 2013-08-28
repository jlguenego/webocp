/*!
 * jQuery UI Progressbar
 *
 *
 * Depends:
 *   jquery.ui.core.js
 *   jquery.ui.widget.js
 */
(function( $, undefined ) {

$.widget( "ui.ocp_progressbar", {
	version: "0.0.1",
	options: {
		// Action
		// Callback
	},

	progressbar_container: null,
	percentage: null,
	progressbar: null,
	progressbar_fill: null,

	_create: function() {
		this.element.addClass('ocp_wd_pb_progressbar_block');

		this.progressbar_container = $('<div/>').appendTo(this.element);
		this.progressbar_container.addClass('ocp_wd_pb_progressbar_container');
		this.progressbar_container.width(this.element.width());

		this.percentage = $('<div/>').appendTo(this.progressbar_container);
		this.percentage.addClass('ocp_wd_pb_percentage');
		this.percentage.html('0%');

		this.progressbar = $('<div/>').appendTo(this.progressbar_container);
		this.progressbar.addClass('ocp_wd_pb_progressbar');

		this.progressbar_fill = $('<div/>').appendTo(this.progressbar);
		this.progressbar_fill.addClass('ocp_wd_pb_progressbar_fill');
	},

	_destroy: function() {
	},

	set_progress: function(progress) {
		if (progress >= 100) {
			progress = 100;
		}

		this.progressbar_fill.width(progress + '%');
		this.percentage.html(progress + '%');
	}
});

})( jQuery );
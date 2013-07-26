/*!
 * jQuery UI Splitpane
 *
 *
 * Depends:
 *   jquery.ui.core.js
 *   jquery.ui.widget.js
 */

(function( $, undefined ) {

$.widget( "ui.ocp_splitpane_h", {
	version: "0.0.1",
	options: {
		source: [],
		overflow: 'auto'
	},

	leftpane: null,
	rightpane: null,
	resizebar: null,
	resizebar_helper: null,

	_create: function() {
		this.element.cleanBlank();

		this.leftpane = $(this.element.children().get(0));
		this.rightpane = $(this.element.children().get(1));
		this.resizebar = $('<div class="widget_splitpane_h_resizebar"/>').insertBefore(this.rightpane);

		this.element.addClass('widget_splitpane_h');
		this.leftpane.addClass('widget_splitpane_h_left');
		this.rightpane.addClass('widget_splitpane_h_right');

		if (this.options.source[0]) {
			this.leftpane.css(this.options.source[0]);
		}
		if (this.options.source[1]) {
			this.rightpane.css(this.options.source[1]);
		}

		this._refresh();

		var self = this;
		this.resizebar.mousedown(function(e) {
			if (e.button == 0) { // left click
				e.preventDefault();
				self._start_resize(e);
			}
		});

		$(window).resize(function() {
			self._refresh();
		});

		return this;
	},

	_destroy: function() {
	},

	_start_resize: function(e) {
        this.resizebar_helper = this.resizebar.clone().appendTo(this.element);
        this.resizebar_helper.addClass('widget_resizebar_h_helper');

        var resizebar_offset = this.resizebar.offset();
        this.resizebar_helper.offset(resizebar_offset);

        var self = this;
        $(window).bind('mousemove', function(e){
        	e.preventDefault();
			var offset = self.resizebar_helper.offset();
			offset.left = e.pageX;

			// Check that the helper stay inside the container
			var container_left = self.element.offset().left;
			var container_right = container_left + self.element.width() - self.resizebar_helper.width();
			offset.left = Math.max(offset.left, container_left);
			offset.left = Math.min(offset.left, container_right);

			self.resizebar_helper.offset(offset);
		});

    	$(window).bind('mouseup', function(e) {
    		if (e.button == 0) { // left click
    			e.preventDefault();
				self._stop_resize(e);
			}
		});
	},

	_stop_resize: function(e) {
		$(window).unbind('mousemove');
		$(window).unbind('mouseup');

		var leftpane_width = this.leftpane.width() + this.resizebar_helper.offset().left - this.resizebar.offset().left;
		if (this.resizebar_helper) {
			this.resizebar_helper.remove();
			this.resizebar_helper = null;
		}

        this.leftpane.width(leftpane_width);
        this._refresh();
        $(window).trigger('resize');
	},

	_refresh: function() {
		var container_w = this.element.width();
		var left_w = this.leftpane.width();
		var resizebar_w = this.resizebar.width();
		this.rightpane.width(container_w - left_w - resizebar_w);
	}
});

})( jQuery );
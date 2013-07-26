/*!
 * jQuery UI Splitpane Vertical
 *
 *
 * Depends:
 *   jquery.ui.core.js
 *   jquery.ui.widget.js
 */

(function( $, undefined ) {

$.widget( "ui.ocp_splitpane_v", {
	version: "0.0.1",
	options: {
		source: [],
		overflow: 'auto'
	},

	toppane: null,
	bottompane: null,
	resizebar: null,
	resizebar_helper: null,

	_create: function() {
		this.element.cleanBlank();

		this.toppane = $(this.element.children().get(0));
		this.bottompane = $(this.element.children().get(1));
		this.resizebar = $('<div class="widget_splitpane_resizebar"/>').insertBefore(this.bottompane);

		this.element.addClass('widget_splitpane');
		this.toppane.addClass('widget_splitpane_top');
		this.bottompane.addClass('widget_splitpane_bottom');

		if (this.options.source[0]) {
			this.toppane.css(this.options.source[0]);
		}
		if (this.options.source[1]) {
			this.bottompane.css(this.options.source[1]);
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
        this.resizebar_helper.addClass('widget_resizebar_helper');

        var resizebar_offset = this.resizebar.offset();
        this.resizebar_helper.offset(resizebar_offset);

        var self = this;
        $(window).bind('mousemove', function(e){
        	e.preventDefault();
			var offset = self.resizebar_helper.offset();
			offset.top = e.pageY;

			// Check that the helper stay inside the container
			var container_top = self.element.offset().top;
			var container_bottom = container_top + self.element.height() - self.resizebar_helper.height();
			offset.top = Math.max(offset.top, container_top);
			offset.top = Math.min(offset.top, container_bottom);

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

		var toppane_height = this.toppane.height() + this.resizebar_helper.offset().top - this.resizebar.offset().top;
		if (this.resizebar_helper) {
			this.resizebar_helper.remove();
			this.resizebar_helper = null;
		}

        this.toppane.height(toppane_height);
        this._refresh();
        $(window).trigger('resize');
	},

	_refresh: function() {
		var container_w = this.element.height();
		var top_h = this.toppane.height();
		var resizebar_h = this.resizebar.height();
		this.bottompane.height(container_w - top_h - resizebar_h);
	}
});

})( jQuery );
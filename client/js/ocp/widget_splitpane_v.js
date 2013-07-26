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
		overflow: 'auto',
		size: { top: 100 },
		fixed: 'top'
	},

	toppane: null,
	bottompane: null,
	resizebar: null,
	resizebar_helper: null,

	_create: function() {
		this.element.cleanBlank();

		this.toppane = $(this.element.children().get(0));
		this.bottompane = $(this.element.children().get(1));
		this.resizebar = $('<div/>').insertBefore(this.bottompane);


		this.element.addClass('widget_splitpane_v');
		this.toppane.addClass('widget_splitpane_v_top');
		this.bottompane.addClass('widget_splitpane_v_bottom');
		this.resizebar.addClass('widget_splitpane_v_resizebar');

		if (this.options.source[0]) {
			this.toppane.css(this.options.source[0]);
		}
		if (this.options.source[1]) {
			this.bottompane.css(this.options.source[1]);
		}

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

		this.resize(this.options.size);

		return this;
	},

	_destroy: function() {
	},

	_start_resize: function(e) {
        this.resizebar_helper = this.resizebar.clone().appendTo(this.element);
        this.resizebar_helper.addClass('widget_resizebar_v_helper');

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

		var step = (this.resizebar_helper.offset().top - this.resizebar.offset().top);
		if (this.resizebar_helper) {
			this.resizebar_helper.remove();
			this.resizebar_helper = null;
		}

        if (this.options.fixed == 'top') {
			this.toppane.height(this.toppane.height() + step);
		} else {
			this.bottompane.height(this.bottompane.height() - step);
		}
        this._refresh();
        $(window).trigger('resize');
	},

	_refresh: function() {
		console.log('refresh splitapane vert');
		var container_w = this.element.height();
		var resizebar_h = this.resizebar.height();
		if (this.options.fixed == 'top') {
			var top_h = this.toppane.height();
			this.bottompane.height(container_w - top_h - resizebar_h);
		} else {
			var bottom_h = this.bottompane.height();
			this.toppane.height(container_w - bottom_h - resizebar_h);
		}
	},

	resize: function(obj) {
		console.log(obj);
		if (obj.top) {
			this.toppane.height(obj.top);
			this._refresh();
		} else if (obj.bottom) {
			this.bottompane.height(obj.bottom);
			var container_w = this.element.height();
			var resizebar_h = this.resizebar.height();
			this.toppane.height(container_w - resizebar_h - obj.bottom);
			this._refresh();
		}
		$(window).trigger('resize');
	}
});

})( jQuery );
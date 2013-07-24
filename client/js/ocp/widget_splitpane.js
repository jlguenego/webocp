/*!
 * jQuery UI Splitpane
 *
 *
 * Depends:
 *   jquery.ui.core.js
 *   jquery.ui.widget.js
 */


(function( $, undefined ) {

$.widget( "ui.ocp_splitpane", {
	version: "0.0.1",
	options: {
		source: [],
		overflow: 'auto'
	},
	g_scrollbar_offset: null,

	leftpane: null,
	rightpane: null,
	resizebar: null,
	resizebar_helper: null,

	start_x: null,
	old_x: null,

	_create: function() {
		this._clean_div();

		this.leftpane = $(this.element.children().get(0));
		this.rightpane = $(this.element.children().get(1));
		this.resizebar = $('<div class="widget_splitpane_resizebar"/>').insertBefore(this.rightpane);

		this.element.addClass('widget_splitpane');
		this.leftpane.addClass('widget_splitpane_left');
		this.rightpane.addClass('widget_splitpane_right');

		if (this.options.source[0]) {
			this.leftpane.css(this.options.source[0]);
		}
		if (this.options.source[1]) {
			this.rightpane.css(this.options.source[1]);
		}

		this._refresh();

		var self = this;
		this.resizebar.mousedown(function(e) {
			self._start_resize(e);
		});

		return this;
	},

	_destroy: function() {
	},

	_start_resize: function(e) {
		if (e.button == 0) { // left click
			e.preventDefault();
	        this.resizebar_helper = this.resizebar.clone().appendTo(this.element);
	        this.resizebar_helper.addClass('widget_resizebar_helper');

	        var resizebar_offset = this.resizebar.offset();
	        this.resizebar_helper.offset(resizebar_offset);

	        var self = this;
	        this.start_x = e.pageX;
	        $(window).bind('mousemove', function(event){
				var offset = self.resizebar_helper.offset();
				offset.left = event.pageX;

				// Check that the helper stay inside the container
				var container_left = self.element.offset().left;
				var container_right = container_left + self.element.width() - self.resizebar_helper.width();
				offset.left = Math.max(offset.left, container_left);
				offset.left = Math.min(offset.left, container_right);

				self.resizebar_helper.offset(offset);
			});

	    	$(window).bind('mouseup', function(e) {
				self._stop_resize(e);
			});
	    }
	},

	_stop_resize: function(e) {
		if (e.button == 0) { // left click
			$(window).unbind('mousemove');
			$(window).unbind('mouseup');

			var leftpane_width = this.leftpane.width() + this.resizebar_helper.offset().left - this.resizebar.offset().left;
			if (this.resizebar_helper) {
				this.resizebar_helper.remove();
				this.resizebar_helper = null;
			}

	        this.leftpane.width(leftpane_width);
	        this._refresh();
	    }
	},

	_clean_div: function() {
		var clean_html = this.element.html().replace(/>\s+</g, '><');
		this.element.html(clean_html);
	},

	_refresh: function() {
		var container_w = this.element.width();
		var left_w = this.leftpane.width();
		var resizebar_w = this.resizebar.width();
		this.rightpane.width(container_w - left_w - resizebar_w);
	},

	get_scrollbar_width: function() {
		// Find the Width of the Scrollbar
		var div = $('<div id="get_scrollbar_width_1" style="width:50px;height:50px;overflow-y:scroll;position:absolute;top:-200px;left:-200px;"><div id="get_scrollbar_width_2" style="height:100px;width:100%"></div></div>');
		div.appendTo($('body'));
		var w1 = $("#get_scrollbar_width_1").width();
		var w2 = $("#get_scrollbar_width_2").innerWidth();
		div.remove(); // remove the html from your document
		return w1 - w2;
	}
});

})( jQuery );
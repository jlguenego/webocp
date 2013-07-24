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

	_create: function() {
		this._clean_div();

		var leftpane = $(this.element.children().get(0));
		var rightpane = $(this.element.children().get(1));
		var leftpane_block = $('<div class="widget_leftpane_block"/>').html(leftpane.html());
		leftpane.html(leftpane_block);

		this.element.addClass('widget_splitpane_container');
		leftpane.addClass('widget_splitpane_left');
		rightpane.addClass('widget_splitpane_right');

		this.resizable(leftpane);

		if (this.options.source[0]) {
			leftpane.css(this.options.source[0]);
		}
		if (this.options.source[1]) {
			rightpane.css(this.options.source[1]);
		}

		this.g_scrollbar_offset = this.get_scrollbar_width() - 12;

		var self = this;
		this._refresh();
		$(window).resize(function() {
			self._refresh();
		});

		return this;
	},

	_destroy: function() {
	},

	resizable: function(leftpane) {
		var self = this;
		leftpane.resizable({
			helper: "ui-resizable-helper",
			handles: 'e',
			minWidth: 100,
			start: function( event, ui ) {
				var helper = ui.helper;
				helper.height(helper.height() + 1);
			},
			stop: function( event, ui ) {
				var container_w = $(this).parent().innerWidth();
				sidebar_w = $(this).width();
				$(this).find('.widget_leftpane_block').width(sidebar_w - self.g_scrollbar_offset);
				$(this).parent().find('.widget_splitpane_right').width(container_w - sidebar_w);
			}
		});

		leftpane.find('.widget_leftpane_block').css({
			overflow: this.options.overflow,
			width: '100%',
			height: '100%'
		});
	},

	_clean_div: function() {
		var clean_html = this.element.html().replace(/>\s+</g, '><');
		this.element.html(clean_html);
	},

	_refresh: function() {
		var container_w = this.element.innerWidth();
		var left_pane = this.element.find('.widget_splitpane_left');
		var right_pane = this.element.find('.widget_splitpane_right');
		sidebar_w = left_pane.width();
		content_w = container_w - sidebar_w;
		if (content_w < 100) {
			content_w = 100;
			sidebar_w = container_w - content_w;
		}

		left_pane.resizable("option", "maxWidth", container_w - 100);
		left_pane.width(sidebar_w);
		left_pane.find('.widget_leftpane_block').width(sidebar_w - this.g_scrollbar_offset);

		right_pane.width(content_w);

		var container_h = this.element.innerHeight();
		left_pane.height(container_h);
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
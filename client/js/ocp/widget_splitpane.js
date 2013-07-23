/*!
 * jQuery UI Splitpane
 *
 *
 * Depends:
 *   jquery.ui.core.js
 *   jquery.ui.widget.js
 */


var g_scrollbar_offset = null;

(function( $, undefined ) {

$.widget( "ui.ocp_splitpane", {
	version: "0.0.1",
	options: {
		source: []
	},

	_create: function() {
		this._clean_div();

		var leftpane = $(this.element.find('div').get(0));
		var rightpane = $(this.element.find('div').get(1));
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

		g_scrollbar_offset = this.get_scrollbar_width() - 12;
		this._refresh();
		$(window).resize(this._refresh);

		return this;
	},

	_destroy: function() {
	},

	resizable: function(leftpane) {
		leftpane.resizable({
			helper: "ui-resizable-helper",
			handles: 'e',
			minWidth: 100,
			start: function( event, ui ) {
				var helper = ui.helper;
				helper.height(helper.height() + 1);
			},
			stop: function( event, ui ) {
				var container_w = $('.widget_splitpane_container').innerWidth();
				sidebar_w = $(this).width();
				$('.widget_leftpane_block').width(sidebar_w - g_scrollbar_offset);
				$('.widget_splitpane_right').width(container_w - sidebar_w);
			}
		});

		$('.widget_leftpane_block').css({
			overflow:'auto',
			width:'100%',
			height:'100%'
		});
	},

	_clean_div: function() {
		var clean_html = this.element.html().replace(/>\s+</g, '><');
		this.element.html(clean_html);
	},

	_refresh: function() {
		var container_w = $('.widget_splitpane_container').innerWidth();
		sidebar_w = $('.widget_splitpane_left').width();
		content_w = container_w - sidebar_w;
		if (content_w < 100) {
			content_w = 100;
			sidebar_w = container_w - content_w;
		}

		console.log('content_w=' + content_w);
		$('.widget_splitpane_left').resizable("option", "maxWidth", container_w - 100);

		$('.widget_splitpane_left').width(sidebar_w);
		$('.widget_leftpane_block').width(sidebar_w - g_scrollbar_offset);
		$('.widget_splitpane_right').width(content_w);

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
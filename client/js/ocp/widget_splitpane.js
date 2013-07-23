/*!
 * jQuery UI Tree
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
		var leftpane = $(this.element.find('div').get(0));
		var rightpane = $(this.element.find('div').get(1));
		var leftpane_block = $('<div class="leftpane_block"/>').html(leftpane.html());
		leftpane.html(leftpane_block);

		this.element.addClass('splitpane_container');
		leftpane.addClass('splitpane_left');
		rightpane.addClass('splitpane_right');

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
				var container_w = $('.splitpane_container').innerWidth();
				sidebar_w = $(this).width();
				$('.leftpane_block').width(sidebar_w - g_scrollbar_offset);
				$('.splitpane_right').width(container_w - sidebar_w);
			}
		});

		$('.leftpane_block').css({
			overflow:'auto',
			width:'100%',
			height:'100%'
		});
	},

	_refresh: function() {
		var container_w = $('.splitpane_container').innerWidth();
		sidebar_w = $('.splitpane_left').width();
		content_w = container_w - sidebar_w;
		if (content_w < 100) {
			content_w = 100;
			sidebar_w = container_w - content_w;
		}

		console.log('content_w=' + content_w);
		$('.splitpane_left').resizable("option", "maxWidth", container_w - 100);

		$('.splitpane_left').width(sidebar_w);
		$('.leftpane_block').width(sidebar_w - g_scrollbar_offset);
		$('.splitpane_right').width(content_w);

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
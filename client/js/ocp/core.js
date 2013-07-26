var ocp = {};

ocp.base = '';
ocp.css = {};
ocp.css.theme = 'default';

$.ocp = {};

// TO BE USED FROM A SERVER ONLY {
function require_once_js(path) {
	var id = 'require_once_js_' + path.replace(/[/.#]/g, '_');
	if (!$('#' + id).length) {
		$('head').append('<script id="' + id + '" type="text/javascript" src="' + path + '"></script>');
	}
}

function require_once_css(path) {
	var id = 'require_once_css_' + path.replace(/[/.#]/g, '_');
	if (!$('#' + id).length) {
		$('head').append('<link id="' + id + '" rel="stylesheet" href="' + path + '" />');
	}
}

(function($) {
    $.fn.hasVerticalScrollBar = function() {
        return this.get(0).scrollHeight > this.height();
    }

    $.fn.hasHorizontalScrollBar = function() {
        return this.get(0).scrollWidth > this.width();
    }

    $.fn.hasScrollBar = function() {
        return this.hasVerticalScrollBar() || this.hasHorizontalScrollBar();
    }

    $.fn.getScrollbarWidth = function() {
       // Find the Width of the Scrollbar
		var div = $('<div id="get_scrollbar_width_1" style="width:50px;height:50px;overflow-y:scroll;position:absolute;top:-200px;left:-200px;"><div id="get_scrollbar_width_2" style="height:100px;width:100%"></div></div>');
		div.appendTo($('body'));
		var w1 = $("#get_scrollbar_width_1").width();
		var w2 = $("#get_scrollbar_width_2").innerWidth();
		div.remove(); // remove the html from your document
		return w1 - w2;
    }

    $.fn.scrollWidth = function() {
        return this.get(0).scrollWidth;
    }

    $.fn.scrollHeight = function() {
        return this.get(0).scrollHeight;
    }

    $.fn.cleanBlank = function() {
    	var clean_html = this.html().replace(/>\s+</g, '><');
		this.html(clean_html);
        return this;
    }
})(jQuery);
// }


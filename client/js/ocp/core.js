ocp.base = '';
ocp.css = {};
ocp.css.theme = 'default';

$.ocp = {};

// BROWSER CHECKING
jQuery.support.cors = true; // force cross-site scripting (IE specific)

console = console || {};
console.log = console.log || function() {};

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

String.prototype.getFileExtention = function() {
    return (/[.]/.exec(this)) ? /[^.]+$/.exec(this) : undefined;
};


function strip_slash(str) {
	if (str.endsWith('/')) {
		return str.substring(0, str.length - 1);
    }
    return str;
}

function is_even(n) {
	return (n % 2) == 0;
}

function is_odd(n) {
	return (n % 2) == 1;
}

function get_uri_fi(uri) {
	var result = '' + uri;
	if (result.indexOf('#') == -1) {
		return '';
	}
	result = result.replace(/^.*#(.*)$/, '$1');
	return result;
}

function is_file_protocol() {
	return /^file:\/\//i.test(window.location.href);
}

function ocp_now() {
	return new Date().getTime();
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

    $.fn.dblclickPreventDefault = function() {
    	var f = this.__dblclickPreventDefault();
		f();
    }

    $.fn.__dblclickPreventDefault = function() {
		var mouse_down_last_t = 0;
		var self = this;
		return function() {
			self.mousedown(function(e) {
				var now_t = new Date().getTime();
				if (now_t - mouse_down_last_t < 500) {
					e.preventDefault();
				}
				mouse_down_last_t = new Date().getTime();
			});
		};
    }

    $.fn.yannisCount = function() {
    	var yannis = 0;
    	return function() {
    		yannis++;
    		return yannis;
    	};
    }
})(jQuery);



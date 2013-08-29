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

var g_ocp_client = null;
var g_session = null;

function ocp_save_local() {
	if (localStorage) {
		localStorage.setItem('ocp_client', JSON.stringify(g_ocp_client));
	}
}

function ocp_restore_local() {
	if (localStorage) {
		var obj = localStorage.getItem('ocp_client');
		if (obj) {
			g_ocp_client = JSON.parse(obj);
			if (g_ocp_client.session) {
				g_session = g_ocp_client.session;
			}
		} else {
			g_ocp_client = {
				server_base_url: 'http://www.ocpforum.org',
				session: null
			};
		}
	}
}

function normalize_path(path) {
    path = path.replace(/[\/]{2,}/g,'/');
	if (path != '/' && path.endsWith('/')) {
		return path.substring(0, path.length - 1);
    }
	return path;
}

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

function stacktrace() {
	function st2(f) {
		if (!f) {
			return [];
		}
		var args = '';
		if (f.arguments) {
			var args_a = Array.prototype.slice.call(f.arguments);
			args = args_a.join(',');
		}
		var v = [f.toString().split('(')[0].substring(9) + '(' + args + ')'];
		return st2(f.caller).concat(v);
	}
	return st2(arguments.callee.caller);
}

function OCPException(msg) {
	this.msg = msg;
	this.stacktrace = stacktrace();
}

function is_file_protocol() {
	return /^file:\/\//i.test(window.location.href);
}

function ocp_now() {
	return new Date().getTime();
}

function ocp_format_size(bytes, precision) {
	precision = precision || 2;
	var units = [ 'B', 'KB', 'MB', 'GB', 'TB' ];

    bytes = Math.max(bytes, 0);
    var pow = 0;
    if (bytes > 0) {
    	pow = Math.floor(Math.log(bytes) / Math.log(1024));
    }

    pow = Math.min(pow, units.length - 1);
    bytes /= Math.pow(1024, pow);
	bytes = Math.round(bytes * Math.pow(10, precision)) / Math.pow(10, precision);
    return bytes + ' ' + units[pow];
}

function ocp_format_date(timestamp, format) {
	format = format || '%Y-%m-%d %H:%M:%S';
	var date = new Date(timestamp * 1000);

	var month = date.getMonth() + 1;
	if (month < 10) {
		month = '0' + month;
	}
	var day = date.getDate();
	if (day < 10) {
		day = '0' + day;
	}
	var hour = date.getHours();
	if (hour < 10) {
		hour = '0' + hour;
	}
	var minute = date.getMinutes();
	if (minute < 10) {
		minute = '0' + minute;
	}
	var second = date.getSeconds();
	if (second < 10) {
		second = '0' + second;
	}

	var result = format.replace('%Y', date.getFullYear());
	result = result.replace('%m', month);
	result = result.replace('%d', day);
	result = result.replace('%H', hour);
	result = result.replace('%M', minute);
	result = result.replace('%S', second);
	return result;
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



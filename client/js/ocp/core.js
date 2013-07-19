var ocp = {};

ocp.base = '';
ocp.css = {};
ocp.css.theme = 'default';

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

$.ocp = {};
(function(ocp, undefined) {
	ocp.worker_ui = {};

	ocp.worker_ui.getBaseURL = function() {
		var base_url = window.location.href;
		if (!/\/$/.test(base_url)) {
			base_url = ocp.dirname(base_url)
		}

		return base_url;
	};

	ocp.worker_ui.getURL = function(filename) {
		var worker = $('<script/>');
		worker.attr('id', 'worker_1');
		worker.attr('type', 'text/js-worker');
		worker.html('importScripts(base_url + "/' + filename + '");');
		$('body').append(worker);

		var base_url = ocp.worker_ui.getBaseURL();
		var base_href = $('base').attr('href') || '';
		if (!/^http:\/\//.test(base_href)) { // Is base_href relative?
			base_url += '/' + base_href;
		}
		var array = ['var base_url = "' + base_url + '";' + $('#worker_1').html()];
		var blob = new Blob(array, {type: "text/javascript"});
		worker.remove();
		return window.URL.createObjectURL(blob);
	};

	ocp.worker_ui.getEmbeddedURL = function(id) {
		var base_url = ocp.worker_ui.getBaseURL();
		var base_href = $('base').attr('href');
		if (!/^http:\/\//.test(base_href)) { // Is base_href relative?
			base_url += '/' + base_href;
		}
		var script_content = $('#' + id).html();

		var array = ['var base_url = "' + base_url + '";' + script_content];
		var blob = new Blob(array, {type: "text/javascript"});
		return window.URL.createObjectURL(blob);
	};
})(ocp)
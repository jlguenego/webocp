(function(ocp, undefined) {
	ocp.test = {};

	ocp.test.sleep = function(time) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', ocp.dht.get_endpoint_url(null, 'wait', '?time=' + time), false);
		xhr.send();
	};
})(ocp);
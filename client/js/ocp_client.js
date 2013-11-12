(function(ocp, undefined) {
	ocp.client = {};

	ocp.client.command = function(data, url) {
		if (!url) {
			throw new Error('No URL given.');
		}
		$.ajaxSetup({
			cache: false,
			scriptCharset: "utf-8"
		});

		var result = null;
		console.log(data);
		console.log('url=' + url);
		$.ajax({
			type: "GET",
			url: url,
			async: false,
			data: data,
			success: function(data) {
				//console.log(data);
				var output = $.parseJSON(data);
				if (output.error) {
					throw new Error('Server answered: ' + output.error);
				}
				if (output.result) {
					result = output.result;
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				console.log('ocp.filesystem error');
				console.log('jqXHR=' + jqXHR + "\ntextStatus=" + textStatus + "\nerrorThrown=" + errorThrown);
				throw new Error('It seems that the server is not responding...');
			},
			statusCode: {
				404: function() {
					console.log("page not found");
				}
			}
		});

		return result;
	};

	ocp.client.async_command = function(data, url, onsuccess, onerror) {
		$.ajaxSetup({
			cache: false,
			scriptCharset: "utf-8"
		});

		console.log(data);
		console.log('url=' + url);
		$.ajax({
			type: "GET",
			url: url,
			async: true,
			data: data,
			success: function(data) {
				console.log(data);
				var output = $.parseJSON(data);
				if (output.error) {
					if (onerror) {
						onerror();
					}
					ocp.error_manage(new Error('Server answered: ' + output.error));
					return;
				}
				if (onsuccess) {
					onsuccess(output.result);
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				console.log('ocp.filesystem error');
				console.log('jqXHR=' + jqXHR + "\ntextStatus=" + textStatus + "\nerrorThrown=" + errorThrown);
				console.log(jqXHR);
				if (onerror) {
					onerror();
				}
				if (jqXHR.status == 0) {
					ocp.error_manage(new Error('URL ' + url + ' not reachable.'));
				} else {
					ocp.error_manage(new Error(errorThrown));
				}
			},
			statusCode: {
				404: function() {
					console.log("page not found");
				}
			}
		});
	};

	ocp.client.get_public_ip = function() {
		var result = {};
		$.ajax({
			type: "POST",
			url: 'http://ip-api.com/json',
			async: false,
			data: {},
			success: function(data) {
				result = data;
			}
		});
		return result.query;
	};
})(ocp)
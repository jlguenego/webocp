(function(ocp, undefined) {
	ocp.file = {};

	ocp.file.max_retry = 0;

	ocp.file.send = function(filename, content, retry) {
		retry = retry || 0;
		var upload_server_uri = ocp.cfg.server_base_url + '/webocp/server/test/endpoint/create_file_from_string.php';

		var formData = new FormData();
		formData.append('filename', filename);
		var blob = new Blob([content], { type: "application/octet-stream" });
		formData.append('content', blob);

		b_success = true;

		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			console.log('xhr.readyState=' + xhr.readyState);
			if (xhr.readyState != 4) {
				return;
			}
			console.log('xhr.status=' + xhr.status);
			if (xhr.status == 0 || xhr.status >= 400) { // no success
				if (retry < ocp.file.max_retry) {
					retry++;
					console.log('xhr.readyState=' + xhr.readyState);
					ocp.file.send(filename, content, retry);
				} else {
					console.log('Too many retries: sending exception.');
					b_success = false;
				}
			}
			if (xhr.status == 200) { // on success
				var json_obj = JSON.parse(xhr.responseText);
			}
		}
		xhr.open('POST', upload_server_uri, false); // sync
		try {
			xhr.send(formData);
		} catch (e) {
			console.log('error=' + e);
			if (!b_success) {
				throw 'Cannot send the file.';
			}
		}
	}

	ocp.file.retrieve = function(filename) {
		var download_server_uri = ocp.cfg.server_base_url + '/webocp/server/test/endpoint/retrieve_file.php';

		var formData = new FormData();
		formData.append('filename', filename);

		var xhr = new XMLHttpRequest();
		var content = '';
		xhr.onreadystatechange = function(){
			if (xhr.readyState == 4 && xhr.status == 200) { // on success
				var json_obj = JSON.parse(xhr.responseText);
				content = ocp.utils.b642ab(json_obj.result.content);
			}
		}
		xhr.open('POST', download_server_uri, false); // Wait before processing file => Synchronous request
		xhr.send(formData);
		return content;
	}
})(ocp)
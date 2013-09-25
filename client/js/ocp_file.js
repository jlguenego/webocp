(function(ocp, undefined) {
	ocp.file = {};

	ocp.file.max_retry = 4;

	ocp.file.send = function(filename, content, on_success, onprogress, retry) {
		retry = retry || 0;
		on_success = on_success || function() {};
		onprogress = onprogress || function() {};

		var contact = ocp.dht.find(filename);
		var upload_server_uri = contact.url + '/endpoint/create_file_from_string.php';

		var formData = new FormData();
		formData.append('filename', filename);
		var blob = new Blob([content], { type: "application/octet-stream" });
		formData.append('content', blob);

		var xhr = new XMLHttpRequest();
		xhr.timeout = 10000;

		xhr.upload.addEventListener('progress', onprogress, false);
		xhr.onreadystatechange = function() {
			//console.log('xhr.readyState=' + xhr.readyState);
			if (xhr.readyState != 4) {
				return;
			}
			//console.log('xhr.status=' + xhr.status);
			if (xhr.status == 0 || xhr.status >= 400) { // no success
				retry++;
				if ((ocp.file.max_retry < 0) || (retry < ocp.file.max_retry)) {
					ocp.file.send(filename, content, on_success, onprogress, retry);
					return;
				}
				throw 'After ' + retry + ' times, cannot send the file: ' + filename;
			}
			// success
			on_success();
		}
		xhr.open('POST', upload_server_uri, true); // async for progress access.

		try {
			xhr.send(formData);
		} catch (e) {
			console.log('error=' + e);
		}
	}

	ocp.file.retrieve = function(filename, on_success, onprogress) {
		on_success = on_success || function() {};
		onprogress = onprogress || function() {};

		var contact = ocp.dht.find(filename);
		var download_server_uri = contact.url + '/endpoint/retrieve_file.php';

		var formData = new FormData();
		formData.append('filename', filename);

		var xhr = new XMLHttpRequest();
		console.log(xhr);
		xhr.upload.addEventListener('progress', onprogress, false);
		xhr.onreadystatechange = function(){
			if (xhr.readyState == 4 && xhr.status == 200) { // on success
				var json_obj = JSON.parse(xhr.responseText);
				var content = ocp.utils.b642ab(json_obj.result.content);
				on_success(content);
			}
		}
		xhr.open('POST', download_server_uri, true);
		xhr.send(formData);
	}

	ocp.file.retrieve_sync = function(filename) {
		var content = null;
		var contact = ocp.dht.find(filename);
		var download_server_uri = contact.url + '/endpoint/retrieve_file.php';

		var formData = new FormData();
		formData.append('filename', filename);

		var xhr = new XMLHttpRequest();
		console.log(xhr);
		xhr.onreadystatechange = function(){
			if (xhr.readyState == 4 && xhr.status == 200) { // on success
				var json_obj = JSON.parse(xhr.responseText);
				if (json_obj.result) {
					content = ocp.utils.b642ab(json_obj.result.content);
				}
			}
		}
		xhr.open('POST', download_server_uri, false);
		xhr.send(formData);
		if (!content) {
			throw new Error('File not found (on contact ' + contact.name + '): ' + filename);
		}
		return content;
	}
})(ocp)
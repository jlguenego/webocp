(function(ocp, undefined) {
	ocp.file = {};

	ocp.file.max_retry = 4;

	ocp.file.send = function(filename, content, onsuccess, onprogress, retry) {
		retry = retry || 0;
		onsuccess = onsuccess || function() {};
		onprogress = onprogress || function() {};

		var contact = ocp.dht.find(filename);
		var upload_server_uri = ocp.dht.get_endpoint_url(contact, 'create_file_from_string');

		var formData = new FormData();
		formData.append('filename', filename);
		var blob = new Blob([content], { type: "application/octet-stream" });
		formData.append('content', blob);

		var xhr = new XMLHttpRequest();
		xhr.timeout = 25000;

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
					ocp.file.send(filename, content, onsuccess, onprogress, retry);
					return;
				}
				throw 'After ' + retry + ' times, cannot send the file: ' + filename;
			}
			// success
			onsuccess();
		}
		xhr.open('POST', upload_server_uri, true); // async for progress access.

		try {
			xhr.send(formData);
		} catch (e) {
			console.log('error=' + e);
		}
	}

	ocp.file.retrieve = function(filename, onsuccess, onprogress, onerror) {
		onsuccess = onsuccess || function() {};
		onprogress = onprogress || function() {};
		onerror = onerror || function() {};


		var formData = new FormData();
		var my_filename = null;
		if (typeof filename == 'string') {
			formData.append('filename', filename);
			my_filename = filename;
		} else if (typeof filename == 'object') {
			for (var prop in filename) {
				formData.append(prop, filename[prop]);
			}
			my_filename = filename.filename;
		}

		var contact = ocp.dht.find(my_filename);
		var download_server_uri = ocp.dht.get_endpoint_url(contact, 'retrieve_file');

		var xhr = new XMLHttpRequest();
		xhr.upload.addEventListener('progress', onprogress, false);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) { // on success
				var json_obj = JSON.parse(xhr.responseText);
				if (typeof filename == 'object') {
					filename = filename.filename;
				}
				if (!json_obj) {
					onerror('Cannot retrieve file ' + filename + '. Cannot parse the endpoint output.');
					return;
				}
				if (json_obj.error) {
					onerror('Cannot retrieve file ' + filename + '. Error = ' + json_obj.error);
					return;
				}
				if (!json_obj.result.content) {
					onerror('Cannot retrieve file ' + filename + '. The endpoint did not send content.');
					return;
				}
				var content = ocp.utils.b642ab(json_obj.result.content);
				onsuccess(content);
			}
		}
		xhr.open('POST', download_server_uri, true);
		xhr.send(formData);
	}

	ocp.file.retrieve_sync = function(filename) {
		var content = null;
		var formData = new FormData();
		var my_filename = null;
		if (typeof filename == 'string') {
			formData.append('filename', filename);
			my_filename = filename;
		} else if (typeof filename == 'object') {
			for (var prop in filename) {
				formData.append(prop, filename[prop]);
			}
			my_filename = filename.filename;
		}

		var contact = ocp.dht.find(my_filename);
		var download_server_uri = ocp.dht.get_endpoint_url(contact, 'retrieve_file');


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

	ocp.file.remove = function(filename, onsuccess, onprogress) {
		onsuccess = onsuccess || function() {};
		onprogress = onprogress || function() {};

		var formData = new FormData();
		var my_filename = null;
		if (typeof filename == 'string') {
			formData.append('filename', filename);
			my_filename = filename;
		} else if (typeof filename == 'object') {
			for (var prop in filename) {
				formData.append(prop, filename[prop]);
			}
			my_filename = filename.filename;
		}

		var contact = ocp.dht.find(my_filename);
		var download_server_uri = ocp.dht.get_endpoint_url(contact, 'remove_file');

		var xhr = new XMLHttpRequest();
		console.log(xhr);
		xhr.upload.addEventListener('progress', onprogress, false);
		xhr.onreadystatechange = function(){
			if (xhr.readyState == 4 && xhr.status == 200) { // on success
				var json_obj = JSON.parse(xhr.responseText);
				onsuccess();
			}
		}
		xhr.open('POST', download_server_uri, true);
		xhr.send(formData);
	}
})(ocp)
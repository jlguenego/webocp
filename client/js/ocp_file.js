(function(ocp, undefined) {
	ocp.file = {};

	ocp.file.send = function(filename, content) {
		var upload_server_uri = ocp.cfg.server_base_url + '/webocp/server/test/endpoint/create_file_from_string.php';

		var formData = new FormData();
		formData.append('filename', filename);
		var blob = new Blob([content], { type: "application/octet-stream" });
		formData.append('content', blob);

		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(){
			if (xhr.readyState == 4 && xhr.status == 200) { // on success
				var json_obj = JSON.parse(xhr.responseText);
			}
		}
		xhr.open('POST', upload_server_uri, false); // sync
		xhr.send(formData);
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
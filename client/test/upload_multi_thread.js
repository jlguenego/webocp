function messageHandler(event) {
	//inform({'message_received': event.data});

	if (event.data.file == 'header') {
		inform('prosessing header');
	} else {
	    work(event.data);
	}
}

function inform(obj) {
	this.postMessage(obj);
}

this.addEventListener('message', messageHandler, false);


function work(data) {
	var file = data.file;
	var cursor = data.cursor;
	var cursor_next = data.cursor_next;
	var server_uri = data.server_uri;

	var reader = new FileReader();
	reader.onload = (function(index, cursor_next, file_size) {
		return function(evt) {
			if (evt.target.readyState == FileReader.DONE) { // DONE == 2
				var filename = process_file(evt.target.result);
				inform({
					filename: filename
				});
			}
		};
	})(data.index, cursor_next, file.size);

	var blob = file.slice(cursor, cursor_next);
	reader.readAsBinaryString(blob);
}

function process_file(file_content, server_uri) {
	update_progress();

	var hex = str2hex(file_content);
	var words = hex2wa(hex);
	update_progress();

	var crypted_content = ocp.pcrypt(secret_key, words);
	update_progress();

	var filename = ocp.hash(crypted_content);
	update_progress();

	send_file(filename, crypted_content, function() {
		update_progress();
	}, server_uri);

	return filename;
};

function update_progress() {
	inform({
		increment: 1
	});
};

function send_file(filename, content, success_func, server_uri) {
	var formdata = new FormData();
	formdata.append('filename', filename);
	var blob = new Blob([content], { type: "text/plain" });
	formdata.append('content', blob);

	$.ajaxSetup({
		cache: false,
		scriptCharset: "utf-8"
	});

	ocp.profile.report('start upload');
	$.ajax({
		type: "POST",
		url: server_uri + '/webocp/server/test/endpoint/create_file_from_string.php',
		async: true,
		processData: false,
		contentType: false,
		data: formdata,
		success: function(data) {
			ocp.profile.report('end upload');
			var output = $.parseJSON(data);
			success_func();
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log('ajax_ls error');
			console.log('jqXHR=' + jqXHR + "\ntextStatus=" + textStatus + "\nerrorThrown=" + errorThrown);
		},
		statusCode: {
			404: function() {
				console.log("page not found");
			}
		}
	});
}

function finish() {
	inform({
		finish: true
	});
	this.close();
}
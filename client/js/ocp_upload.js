(function(ocp, undefined) {
	ocp.upload = {};

	ocp.upload.hat_init = function(args) {
		console.log('upload hat init');
		ocp.cfg.server_base_url = args.server_uri;

		ocp.upload.hat = {};
		ocp.upload.hat.block_nbr = Math.ceil(args.file.size / args.block_size);
		ocp.upload.hat.secret_key = args.secret_key;
		ocp.upload.hat.summary = [];
		ocp.upload.hat.block_size = args.block_size;
		ocp.upload.hat.file = args.file;
		console.log('block_nbr=' + ocp.upload.hat.block_nbr);
	}

	ocp.upload.hat_get_object = function() {
		var result = {
			size: ocp.upload.hat.file.size,
			block_nbr: ocp.upload.hat.block_nbr,
			block_size: ocp.upload.hat.block_size,
			summary: []
		};
		for (var i = 0; i < ocp.upload.hat.summary.length; i++) {
			var obj = ocp.upload.hat.summary[i];
			result.summary[obj.block_id] = obj.filename;
		}
		return result;
	}

	ocp.upload.hat_push = function(args) {
		console.log('upload hat push');
		ocp.upload.hat.summary.push(args);

		if (ocp.upload.hat.summary.length == ocp.upload.hat.block_nbr) {
			console.log('ready to send the summary');

			var content = ocp.upload.hat_get_object();
			console.log('content=');
			console.log(content);
			var str = JSON.stringify(content);

			var filename = ocp.upload.process_block(ocp.utils.str2ab(str), ocp.upload.hat.secret_key);
			report({
				filename: filename,
				finish: true
			});
		}
	}

	ocp.upload.upload_block = function(args) {
		console.log(args);
		ocp.cfg.server_base_url = args.server_uri;

		var file = args.file;
		var blob = file.slice(args.cursor, args.cursor_next);
		var reader = new FileReader();
		reader.onload = function(evt) {
			if (evt.target.readyState == FileReader.DONE) { // DONE == 2
				console.log('block readed');
				var filename = ocp.upload.process_block(evt.target.result, args.secret_key);
				report({
					filename: filename,
					block_id: args.block_id,
					finish: true
				});
			}
		};
		reader.readAsArrayBuffer(blob);
		console.log('update block');
	}

	ocp.upload.process_block = function(block_ab, secret_key) {
		// 1) crypt
		var crypted_block_ab = ocp.crypto.pcrypt(secret_key, block_ab);

		// 2) hash
		var filename = ocp.crypto.hash(crypted_block_ab);

		// 3) upload
		console.log('about to send: ' + filename);
		ocp.file.send(filename, crypted_block_ab);
		return filename;
	}
})(ocp)
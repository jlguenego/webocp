(function(ocp, undefined) {
	ocp.download = {};

	ocp.download.init = function() {
		var worker = ocp.worker.worker;
		worker.requestFileSystemSync = worker.webkitRequestFileSystemSync || worker.requestFileSystemSync;
		worker.fs = worker.requestFileSystemSync(TEMPORARY, 1024 * 1024 * 1024);
	}

	ocp.download.download_hat = function(args) {
		ocp.cfg.server_base_url = args.server_uri;
		var hat_ab = this.retrieve_block(args.block_name, args.secret_key);
		var hat_str = ocp.utils.ab2str(hat_ab);
		var hat = JSON.parse(hat_str);
		console.log('hat=');
		console.log(hat);
		this.create_empty_file(args.block_name, hat.size);
		report({
			hat: hat,
			finish: true
		});
	};

	ocp.download.download_block = function(args) {
		ocp.cfg.server_base_url = args.server_uri;
		var content_ab = this.retrieve_block(args.block_name, args.secret_key);
		var offset = args.block_id * args.block_size;
		//console.log(args);

		ocp.worker_file.write_block(args.hat_name, offset, content_ab);

		report({
			block_id: args.block_id,
			finish: true
		});
	};

	ocp.download.create_empty_file = function(filename, file_length) {
		var content_ab = new ArrayBuffer(file_length);
		ocp.worker_file.create(filename, content_ab);
	};

	ocp.download.retrieve_block = function(block_name, secret_key) {
		// 1) download
		console.log('download file: ' + block_name);
		var crypted_content = ocp.file.retrieve(block_name)

		// 2) verify
		if (this.verify_file_integrity(block_name, crypted_content)) {
			console.log('integrity ok');
		} else {
			console.log('integrity error');
			return;
		}

		// 2) decrypt
		console.log('decrypt');
		var decrypted_ab = ocp.crypto.pdecrypt(secret_key, crypted_content);

		return decrypted_ab;
	};

	ocp.download.verify_file_integrity = function(block_name, crypted_content) {
		var crypted_content_hash = ocp.crypto.hash(crypted_content);
		return block_name == crypted_content_hash;
	}
})(ocp);


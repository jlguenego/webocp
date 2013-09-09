importScripts(base_url + '/_ext/sha1.js');
importScripts(base_url + '/_ext/aes.js');
importScripts(base_url + '/_ext/WorkerFormData.js');

importScripts(base_url + '/js/ocp.js');
importScripts(base_url + '/js/ocp_utils.js');
importScripts(base_url + '/js/ocp_worker.js');
importScripts(base_url + '/js/ocp_crypto.js');
importScripts(base_url + '/js/ocp_file.js');
importScripts(base_url + '/js/ocp_worker_file.js');


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
		console.log({
			block_written: true,
			block_id: args.block_id,
			finish: true
		});
		report({
			block_written: true,
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
		console.log('decryption done');
		return decrypted_ab;
	};

	ocp.download.verify_file_integrity = function(block_name, crypted_content) {
		var crypted_content_hash = ocp.crypto.hash(crypted_content);
		return block_name == crypted_content_hash;
	}
})(ocp);

ocp.worker.init(this, true);

function run(event) {
    var task = event.data;
    switch(task.name) {
    	case 'download_hat':
    		ocp.download.download_hat(task.args);
    		return false;
    	case 'download_block':
    		ocp.download.download_block(task.args);
    		return false;
    }
    return true;
}

function init() {
	ocp.download.init();
}
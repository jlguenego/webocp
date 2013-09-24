importScripts(base_url + '/_ext/sha1.js');
importScripts(base_url + '/_ext/aes.js');

importScripts(base_url + '/js/ocp.js');
importScripts(base_url + '/js/ocp_utils.js');
importScripts(base_url + '/js/ocp_worker.js');
importScripts(base_url + '/js/ocp_crypto.js');
importScripts(base_url + '/js/ocp_file.js');
importScripts(base_url + '/js/ocp_worker_file.js');


(function(ocp, undefined) {
	ocp.download = {};

	ocp.download.init = function() {
		ocp.worker_file.init();
	}

	ocp.download.download = function(args) {
		report({
			action: 'retrieve',
			task_id: ocp.worker.worker.task_id,
			filename: args.block_name,
			block_id: args.block_id
		});
	};

	ocp.download.hat_finalize = function(args) {
		var hat_ab = this.retrieve_block(args.block_name, args.content, args.secret_key);
		var hat_str = ocp.utils.ab2str(hat_ab);
		var hat = JSON.parse(hat_str);
		console.log('hat=');
		console.log(hat);
		this.create_empty_file(args.block_name, hat.size);
		report({
			action: 'finalize',
			hat: hat,
			finish: true
		});
	};

	ocp.download.block_finalize = function(args) {
		var content_ab = this.retrieve_block(args.block_name, args.content, args.secret_key);
		var offset = args.block_id * args.block_size;
		//console.log(args);

		ocp.worker_file.write_block(args.hat_name, offset, content_ab);
		report({
			action: 'finalize',
			block_written: true,
			block_id: args.block_id,
			finish: true
		});
	};

	ocp.download.create_empty_file = function(filename, file_length) {
		ocp.worker_file.create(filename, file_length);
	};

	ocp.download.retrieve_block = function(block_name, crypted_content, secret_key) {
		console.log('block_name=' + block_name);
		console.log('crypted_content=' + crypted_content);
		console.log('secret_key=' + secret_key);
		// 1) verify
		if (this.verify_file_integrity(block_name, crypted_content)) {
			console.log('integrity ok');
		} else {
			console.log('integrity error');
			// TODO: manage error
			return null;
		}

		// 2) decrypt
		console.log('decrypt');
		var decrypted_ab = ocp.crypto.pdecrypt(secret_key, crypted_content);
		console.log('decryption done');
		return decrypted_ab;
	};

	ocp.download.verify_file_integrity = function(block_name, crypted_content) {
		var crypted_content_hash = ocp.crypto.hash(crypted_content);
		console.log('block_name=' + block_name);
		console.log('crypted_content_hash=' + crypted_content_hash);
		return block_name == crypted_content_hash;
	};
})(ocp);

ocp.worker.init(this, true);

function run(event) {
    var task = event.data;
    switch(task.name) {
    	case 'download_hat':
    		switch(task.message) {
    			case undefined:
    				ocp.download.download(task.args);
    				break
    			case 'finalize':
    				ocp.download.hat_finalize(task.args);
    				break
    		}
    		break;
    	case 'download_block':
    		switch(task.message) {
    			case undefined:
    				ocp.download.download(task.args);
    				break
    			case 'finalize':
    				ocp.download.block_finalize(task.args);
    				break
    		}
    		break;
    }
}

function init() {
	ocp.download.init();
}
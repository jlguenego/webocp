importScripts(base_url + '/_ext/sha1.js');
importScripts(base_url + '/_ext/aes.js');

importScripts(base_url + '/js/ocp.js');
importScripts(base_url + '/js/ocp_utils.js');
importScripts(base_url + '/js/ocp_worker.js');
importScripts(base_url + '/js/ocp_crypto.js');
importScripts(base_url + '/js/ocp_file.js');

importScripts(base_url + '/_ext/WorkerFormData.js');

var upload_hat = null;
var upload_block = null;

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
			var str = JSON.stringify(content);

			upload_hat.filename = ocp.upload.common_process(ocp.utils.str2ab(str), ocp.upload.hat.secret_key);

		}
	}

	ocp.upload.block_upload = function(args) {
		ocp.cfg.server_base_url = args.server_uri;
		upload_block.block_id = args.block_id;

		var file = args.file;
		var blob = file.slice(args.cursor, args.cursor_next);
		var reader = new FileReader();
		reader.onload = function(evt) {
			if (evt.target.readyState == FileReader.DONE) { // DONE == 2
				console.log('block readed');
				upload_block.filename = ocp.upload.common_process(evt.target.result, args.secret_key);
				console.log('upload_block.filename=' + upload_block.filename);
			}
		};
		reader.readAsArrayBuffer(blob);
		console.log('update block');
	}

	// call by the two tasks
	ocp.upload.common_process = function(block_ab, secret_key) {
		try {
			// 1) crypt
			var crypted_block_ab = ocp.crypto.pcrypt(secret_key, block_ab);

			// 2) hash
			var filename = ocp.crypto.hash(crypted_block_ab);

			// 3) upload
			console.log('about to send: ' + filename);
			report({
				action: 'send',
				task_id: ocp.worker.worker.task_id,
				filename: filename,
				content: crypted_block_ab
			});
		} catch (e) {
			report({
				exception: e.toString()
			});
		}

		return filename;
	};

	ocp.upload.hat_finalize = function() {
		report({
			action: 'finalize',
			filename: upload_hat.filename,
			finish: true
		});
		upload_hat = null;
	};

	ocp.upload.block_finalize = function() {
		report({
			action: 'push',
			filename: upload_block.filename,
			block_id: upload_block.block_id,
			finish: true
		});
		upload_block = null;
	};
})(ocp);



ocp.worker.init(this, true);

function run(event) {
    var task = event.data;
    try {
	    switch(task.name) {
	    	case 'upload_block':
	    		switch(task.message) {
	    			case undefined:
	    				upload_block = {};
	    				ocp.upload.block_upload(task.args);
	    				break
	    			case 'finalize':
	    				ocp.upload.block_finalize(task.args);
	    				break
	    		}
	    		break;
	    	case 'upload_hat':
	    		switch(task.message) {
	    			case undefined:
	    				upload_hat = {};
	    				ocp.upload.hat_init(task.args);
	    				break
	    			case 'push':
	    				ocp.upload.hat_push(task.args);
	    				break
	    			case 'finalize':
	    				ocp.upload.hat_finalize(task.args);
	    				break
	    		}
	    		break;
	    }
	} catch(e) {
		console.log('Error: ' + e);
	}
}
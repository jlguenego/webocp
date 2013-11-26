(function(ocp, undefined) {
	ocp.block = {};

	ocp.block.send = function(address, content, attributes, onsuccess, onprogress) {
		var new_content = ocp.block.set_content(attributes, content);
		// DANGEROUS (make chrome freeze...) ! console.log(ocp.utils.ab2str(new_content));
		ocp.file.send(address, new_content, onsuccess, onprogress);
		console.log('send successful');
	};

	ocp.block.retrieve = function(filename, onsuccess, onprogress, onerror) {
		var args = {
			filename: filename
		};
		if (ocp.session.rsa) {
			args.signature = ocp.crypto.sign(filename, ocp.session.rsa.private_key);
		}

		function my_onsuccess(onsuccess) {
			return function(content) {
				console.log('my_onsuccess');
				console.log('content.length=' + content.byteLength);
				var my_content = ocp.block.get_content(content);
				console.log('my_content.length=' + my_content.byteLength);
				onsuccess(my_content);
			}
		}

		ocp.file.retrieve(args, my_onsuccess(onsuccess), onprogress, onerror);
	};

	ocp.block.retrieve_sync = function(filename) {
		var args = {
			filename: filename
		};
		if (ocp.session.rsa) {
			args.signature = ocp.crypto.sign(filename, ocp.session.rsa.private_key);
		}
		return ocp.block.get_content(ocp.file.retrieve_sync(args));
	};

	ocp.block.remove = function(filename, onsuccess, onprogress) {
		var args = {
			filename: filename
		};
		if (ocp.session.rsa) {
			args.signature = ocp.crypto.sign(filename, ocp.session.rsa.private_key);
		}
		return ocp.file.remove(args, onsuccess, onprogress);
	};

	ocp.block.get_content = function(block_content) {
		console.log('block_content:');
		console.log(block_content);
		var content_dv = new Uint8Array(block_content);

		var length_ab = new ArrayBuffer(4);
		var length_dv = new Uint8Array(length_ab);

		length_dv.set(content_dv.subarray(0, 4));
		var length = parseInt(ocp.utils.ab2str(length_ab));

		var offset = 4 + length;
		var result = new ArrayBuffer(content_dv.byteLength - offset);
		var result_dv = new Uint8Array(result);
		result_dv.set(content_dv.subarray(offset));
		console.log(result);
		return result;
	};

	ocp.block.set_content = function(attributes, content) {

		var length_str = attributes.byteLength.toString().padleft(4, '0');
		var length_ab = ocp.utils.str2ab(length_str);

		console.log(attributes);
		console.log(content);
		var result = ocp.utils.ab_concat(length_ab, attributes, content);
		return result;
	};
})(ocp)
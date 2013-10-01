(function(ocp, undefined) {
	ocp.block = {};

	ocp.block.send = function(address, content, attributes, on_success, onprogress) {
		var length_str = attributes.byteLength.toString().padleft(4, '0');
		var length_ab = ocp.utils.str2ab(length_str);

		var new_content = ocp.utils.ab_concat(length_ab, attributes, content);
		ocp.file.send(address, new_content, on_success, onprogress);
	};

	ocp.block.retrieve = function(filename, on_success, onprogress, on_error) {
		var args = {
			filename: filename
		};
		if (ocp.session.rsa) {
			args.signature = ocp.crypto.sign(filename, ocp.session.rsa.private_key);
		}

		function my_onsuccess(onsuccess) {
			return function(content) {
				onsuccess(ocp.block.get_content(content));
			}
		}

		ocp.file.retrieve(args, my_onsuccess(onsuccess), onprogress, on_error);
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

	ocp.block.remove = function(filename, on_success, onprogress) {
		var args = {
			filename: filename
		};
		if (ocp.session.rsa) {
			args.signature = ocp.crypto.sign(filename, ocp.session.rsa.private_key);
		}
		return ocp.file.remove(args, on_success, onprogress);
	};

	ocp.block.get_content = function(block_content) {
		var content_dv = new Uint8Array(block_content);
		var length_ab = content_dv.subarray(0, 4).buffer;
		var length = parseInt(ocp.utils.ab2str(length_ab));

		var offset = 4 + length;
		var result = new ArrayBuffer(content_dv.byteLength - offset);
		var result_dv = new Uint8Array(result);
		result_dv.set(content_dv.subarray(offset));
		console.log(result);
		return result;
	};
})(ocp)
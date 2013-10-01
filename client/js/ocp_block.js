(function(ocp, undefined) {
	ocp.block = {};

	ocp.block.send = function(address, content, attributes, on_success, onprogress) {
		on_success = on_success || function() {};
		onprogress = onprogress || function() {};

		var new_content =

		ocp.file.send(address, new_content, on_success, onprogress);
	}

	ocp.block.retrieve = function(filename, on_success, onprogress, on_error) {
		var args = {
			filename: filename
		};
		if (ocp.session.rsa) {
			args.signature = ocp.crypto.sign(filename, ocp.session.rsa.private_key);
		}
		ocp.file.retrieve(args, on_success, onprogress, on_error);
	}

	ocp.block.retrieve_sync = function(filename) {
		var args = {
			filename: filename
		};
		if (ocp.session.rsa) {
			args.signature = ocp.crypto.sign(filename, ocp.session.rsa.private_key);
		}
		return ocp.file.retrieve_sync(args);
	}

	ocp.block.remove = function(filename, on_success, onprogress) {
		var args = {
			filename: filename
		};
		if (ocp.session.rsa) {
			args.signature = ocp.crypto.sign(filename, ocp.session.rsa.private_key);
		}
		return ocp.file.remove(args, on_success, onprogress);
	}
})(ocp)
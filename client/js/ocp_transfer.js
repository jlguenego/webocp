(function(ocp, undefined) {
	ocp.transfer = {};

	ocp.transfer.upload = function() {

	};

	ocp.transfer.download = function() {

	};

	ocp.transfer.send_worker_block = function(args, on_success) {
		ocp.file.send(args.filename, args.content, on_success);
	};

})(ocp);
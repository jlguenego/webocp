(function(ocp, undefined) {
	ocp.worker_file = {};

	ocp.worker_file.write_block = function(filename, offset, content_ab) {
		try {
			var fileEntry = ocp.worker.worker.fs.root.getFile(filename, {create: false});

			var fileWriter = fileEntry.createWriter();
			fileWriter.seek(offset);
			var blob = new Blob([content_ab]);
			fileWriter.write(blob);
		} catch(e) {
			onError(e);
		}
	}

	ocp.worker_file.create = function(filename, content_ab) {
		try {
			var fileEntry = ocp.worker.worker.fs.root.getFile(filename, {create: true, exlusive: true});

			var fileWriter = fileEntry.createWriter();
			var blob = new Blob([content_ab]);
			fileWriter.write(blob);
		} catch(e) {
			onError(e);
		}
	}

	function onError(e) {
		console.log('ERROR: ' + e.toString());
	}
})(ocp);
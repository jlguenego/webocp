(function(ocp, undefined) {
	ocp.worker_file = {};

	ocp.worker_file.max_length = 1 << 20;

	ocp.worker_file.init = function() {
		var worker = ocp.worker.worker;
		worker.requestFileSystemSync = worker.webkitRequestFileSystemSync || worker.requestFileSystemSync;
		worker.fs = worker.requestFileSystemSync(TEMPORARY, 1024 * 1024 * 1024);
	}

	ocp.worker_file.write_block = function(filename, offset, content_ab) {
		try {
			var fileEntry = ocp.worker.worker.fs.root.getFile(filename, {create: false});

			var fileWriter = fileEntry.createWriter();
			ocp.worker_file.seek(fileWriter, offset);
			var blob = new Blob([content_ab]);
			fileWriter.write(blob);
		} catch(e) {
			onError(e);
		}
	}

	ocp.worker_file.seek = function(fileWriter, offset) {
		fileWriter.seek(offset);
		while (offset > fileWriter.position) {
			var len = Math.min(offset - fileWriter.position, ocp.worker_file.max_length);
			var ab = new ArrayBuffer(len);
			var blob = new Blob([ab]);
			fileWriter.write(blob);
		}
	}

	ocp.worker_file.create = function(filename, length) {
		try {
			var fileEntry = ocp.worker.worker.fs.root.getFile(filename, {create: true, exlusive: true});
			var fileWriter = fileEntry.createWriter();
			ocp.worker_file.seek(fileWriter, length);
		} catch(e) {
			onError(e);
		}
	}

	function onError(e) {
		console.log('ERROR: ' + e.toString());
	}
})(ocp);
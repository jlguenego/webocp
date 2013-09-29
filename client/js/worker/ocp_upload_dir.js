importScripts(base_url + '/js/ocp.js');
importScripts(base_url + '/js/ocp_utils.js');
importScripts(base_url + '/js/ocp_worker.js');

(function(ocp, undefined) {
	ocp.upload_dir = {};

	ocp.upload_dir.mkdir = function(args) {
		report({
			action: 'mkdir',
			path: args.path,
			name: args.name
		});
	};

	ocp.upload_dir.upload_file = function(args) {
		report({
			action: 'upload_file',
			filename: args.filename,
			file: args.file
		});
	};

	ocp.upload_dir.finalize = function(args) {
		report({
			action: 'finalize',
			finished: true
		});
	};


})(ocp);



ocp.worker.init(this, true);

var mkdir = null;
var upload_file = null;

function run(event) {
    var task = event.data;
    try {
	    switch(task.name) {
	    	case 'mkdir':
	    		switch(task.message) {
	    			case undefined:
	    				mkdir = {};
	    				ocp.upload_dir.mkdir(task.args);
	    				break;
	    			case 'finalize':
	    				ocp.upload_dir.finalize(task.args);
	    				break;
	    		}
	    		break;
	    	case 'upload_file':
	    		switch(task.message) {
	    			case undefined:
	    				upload_file = {};
	    				ocp.upload_dir.upload_file(task.args);
	    				break;
	    			case 'finalize':
	    				ocp.upload_dir.finalize(task.args);
	    				break;
	    		}
	    		break;
	    }
	} catch(e) {
		console.log('Error: ' + e);
	}
}
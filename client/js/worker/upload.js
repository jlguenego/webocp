importScripts(base_url + '/_ext/sha1.js');
importScripts(base_url + '/_ext/aes.js');

importScripts(base_url + '/js/ocp.js');
importScripts(base_url + '/js/ocp_utils.js');
importScripts(base_url + '/js/ocp_worker.js');
importScripts(base_url + '/js/ocp_crypto.js');
importScripts(base_url + '/js/ocp_file.js');
importScripts(base_url + '/js/ocp_upload.js');

importScripts(base_url + '/_ext/WorkerFormData.js');

ocp.worker.init(this, true);

function run(event) {
    var task = event.data;
    try {
	    switch(task.name) {
	    	case 'upload_block':
	    		ocp.upload.upload_block(task.args);
	    		break;
	    	case 'upload_hat':
	    		switch(task.message) {
	    			case undefined:
	    				ocp.upload.hat_init(task.args);
	    				break
	    			case 'push':
	    				ocp.upload.hat_push(task.args);
	    				break
	    		}
	    		break;
	    }
	} catch(e) {
		console.log('Error: ' + e);
	}
}
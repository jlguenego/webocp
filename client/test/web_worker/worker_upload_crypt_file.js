importScripts(base_url + '/_ext/sha1.js');
importScripts(base_url + '/_ext/aes.js');
importScripts(base_url + '/js/ocp.js');
importScripts(base_url + '/js/ocp_crypto.js');
importScripts(base_url + '/test/web_worker/upload_crypt_file.js');

function run(event) {
    var task = event.data;
    switch(task.name) {
    	case 'process_file':
    		process_file(task.args);
    		break;
    }
}

function inform(obj) {
	this.postMessage(obj);
}

this.addEventListener('message', run, false);

function update_progress() {
	inform({ progress: 1 })
}

function process_file(args) {
	var file_content = args.file_content;

	var hex = str2hex(file_content);
	var words = hex2wa(hex);
	update_progress();

	var crypted_content = ocp.crypto.pcrypt(args.secret_key, words);
	update_progress();

	var filename = ocp.crypto.hash(crypted_content);
	update_progress();

	inform({
		finish: true,
		action: process_file,
		filename: filename,
		crypted_content: crypted_content,
		header_file: args.header_file
	});
};
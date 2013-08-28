importScripts('worker_lib2.js');

function run(event) {
	var msg = event.data;
	this.postMessage({ answer: hello(event.data.name)});
}

this.addEventListener('message', run, false);
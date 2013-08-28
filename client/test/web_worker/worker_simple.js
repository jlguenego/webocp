function run(event) {
	var msg = event.data;
	this.postMessage({ answer: 'Hello ' + msg.name + '!' });
}

this.addEventListener('message', run, false);
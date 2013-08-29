function messageHandler(event) {
    var data = event.data;
    if (data == 'start') {
    	work();
	}
}

function inform(obj) {
	this.postMessage(obj);
}

this.addEventListener('message', messageHandler, false);

function work() {
	var total = 100;
	for (var i = 0; i <= total; i++) {
		sleep(50);
		inform({
			performed: i,
			increment: 1,
			total: total
		});
	}
	inform({
		finish: true
	});
	this.close();
}

function sleep(milliSeconds) {
	var startTime = new Date().getTime();
	while (new Date().getTime() < startTime + milliSeconds);
}
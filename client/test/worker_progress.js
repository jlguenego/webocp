function messageHandler(event) {
    var data = event.data;
    if (data == 'start') {
    	work();
	}
}

function inform(obj) {
	var json = JSON.stringify(obj);
	this.postMessage(json);
}

this.addEventListener('message', messageHandler, false);


function work() {
	var total = 300;
	for (var i = 0; i <= total; i++) {
		sleep(10);
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
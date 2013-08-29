function run(event) {
    var task = event.data;
    switch(task.name) {
    	case 'work':
    		work(task.args);
    		break;
    }
}

function inform(obj) {
	this.postMessage(obj);
}

this.addEventListener('message', run, false);

function work(args) {
	var total = 100;
	for (var i = 0; i <= total; i++) {
		sleep(args.sleep);
		inform({
			performed: i,
			increment: 1,
			total: total
		});
	}
	inform({
		finish: true
	});
}

function sleep(milliSeconds) {
	var startTime = new Date().getTime();
	while (new Date().getTime() < startTime + milliSeconds);
}
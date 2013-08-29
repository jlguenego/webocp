importScripts(base_url + '/js/ocp.js');
importScripts(base_url + '/js/ocp_worker_utils.js');

ocp.worker_utils.init(this);

function run(event) {
    var task = event.data;
    switch(task.name) {
    	case 'work':
    		work(task.args);
    		break;
    }
}

this.addEventListener('message', ocp.worker_utils.run(this, run), false);

function work(args) {
	var total = 100;
	for (var i = 0; i <= total; i++) {
		sleep(args.sleep);
		report({
			performed: i,
			increment: 1,
			total: total
		});
		console('performed: ' + i);
	}
}

function sleep(milliSeconds) {
	var startTime = new Date().getTime();
	while (new Date().getTime() < startTime + milliSeconds);
}
importScripts(base_url + '/js/ocp.js');
importScripts(base_url + '/js/ocp_worker.js');

ocp.worker.init(this, true);

function run(event) {
    var task = event.data;
    switch(task.name) {
    	case 'work':
    		work(task.args);
    		break;
    }
}

function work(args) {
	var total = 100;
	for (var i = 0; i <= total; i++) {
		sleep(args.sleep);
		report({
			performed: i,
			increment: 1,
			total: total
		});
		//console.log('performed: ' + i);
	}
	report({
		finish: true
	});
}

function sleep(milliSeconds) {
	var startTime = new Date().getTime();
	while (new Date().getTime() < startTime + milliSeconds);
}
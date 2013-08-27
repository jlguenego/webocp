function ocp_profile(type) {
	this.start_t = 0;
}

ocp_profile.prototype.start = function() {
    this.start_t = new Date().getTime();
};

ocp_profile.prototype.report = function(tag) {
	var elapsed = new Date().getTime() - this.start_t;
	console.log('[PROFILE] ' + tag + ': ' + elapsed + 'ms');
}
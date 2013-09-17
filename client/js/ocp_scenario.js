// shared_storage
// user_storage
// crypt_blob
(function(ocp, undefined) {
	ocp.scenario = {};

	ocp.scenario.get = function(name) {
		switch(name) {
			case '0':
				return new ocp.scenario.Original();
			case '1':
				return new ocp.scenario.SharedStorage();
			case '2':
				return new ocp.scenario.UserStorage();
			case '3':
				return new ocp.scenario.CryptBlob();
			default:
				throw new Error('scenario id not found: ' + name);
		}
	};
})(ocp);
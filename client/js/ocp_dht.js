(function(ocp, undefined) {
	ocp.dht = {};

	ocp.dht.ring = null;

	ocp.dht.find = function(address) {
		if (!ocp.dht.ring) {
			console.log('new ring');
			ocp.dht.ring = new ocp.dht.Ring();
		}
		var contact = ocp.dht.ring.find(address);
		return contact;
	};

	ocp.dht.Contact = function(args) {
		this.name = args.name;
		this.url = args.url;
		this.start_address = args.start_address;

		this.toString = function() {
			return	this.name + ' ' + this.url + ' ' + this.start_address;
		}
	};

	ocp.dht.Ring = function() {
		this.ring = {};
		this.address_list = [];
		var sponsor_name = ocp.cfg.sponsor_name || 'node0';
		var url = ocp.cfg.server_base_url + '/webocp/server/' + sponsor_name + '/endpoint/get_contact_list.php';
		var contact_list = ocp.client.command({}, url);

		for (var name in contact_list) {
			var contact = new ocp.dht.Contact(contact_list[name]);
			this.ring[contact.start_address] = contact;
			this.address_list.push(contact.start_address);
		}
		this.address_list.sort();

		this.find = function(address) {
			var list = this.address_list.slice(0);
			list.push(address);
			list.sort();
			var index = list.indexOf(address);
			if (index == 0) {
				index = this.address_list.length;
			}
			return this.ring[this.address_list[index - 1]];
		};

		this.toCanvas = function(canvas) {

		};
	};

	ocp.dht.get_address = function(ab) {
		return ocp.crypto.hash(ab);
	};
})(ocp);
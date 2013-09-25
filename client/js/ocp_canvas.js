(function(ocp, undefined) {
	ocp.canvas = {};

	ocp.canvas.Zone = function(space, onmouse, is_inside) {
		this.onmouse = onmouse;

		this.space = space;

		this.is_inside = is_inside || function(e) {
			switch(this.space.type) {
				case 'circle':
					var dist = this.distance(e, this.space.center);
					//console.log('distance=' + dist);
					return dist <= this.space.radius;
			}
		};

		this.distance = function(a, b) {
			var dist_x = a.x - b.x;
			var dist_y = a.y - b.y;
			return Math.sqrt(Math.pow(dist_x, 2) + Math.pow(dist_y, 2));
		};
	};

	ocp.canvas.Canvas = function() {
		this.zone_list = [];

		this.get_zones = function(e) {
			console.log(e);
			var result = [];
			console.log(this.zone_list);
			for (var i = 0; i < this.zone_list.length; i++) {
				var zone = this.zone_list[i];
				if (zone.is_inside(e)) {
					result.push(zone);
				}
			}
			return result;
		};
	};
})(ocp);
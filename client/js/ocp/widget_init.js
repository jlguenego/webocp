function load_script_array(scripts) {

	var i = 0;

	function update_progress() {
		var percent = Math.floor((i * 100) / scripts.length);
		document.getElementById('loading_progress_fill').style.width = percent + '%';
	}

	function load_script(script_url, after_load_func) {
		console.log('script_url=' + script_url);

		var head = document.getElementsByTagName('head')[0];
		var el = null;
		if (/\.css$/.test(script_url)) { // is css
			el = document.createElement('link');
			el.rel = 'stylesheet';
			el.type = 'text/css';
			el.href = script_url;
		} else { // is js
			el= document.createElement('script');
			el.type = 'text/javascript';
			el.src = script_url;
		}
		head.appendChild(el);

		el.onreadystatechange = after_load_func;
		el.onload = after_load_func;
	}

	function recursive_load() {
		i++;
		update_progress();
		if (i < scripts.length) {
			load_script(scripts[i], recursive_load);
		} else {
			console.log('finished.');
			$('#loading').hide();
		}
	}

	load_script(scripts[0], recursive_load);
}
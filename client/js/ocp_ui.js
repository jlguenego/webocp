(function(ocp, undefined) {
	ocp.ui = {};

	ocp.ui.cursor_wait_start = function() {
		console.log('cursor_wait_start');
		$('html, body').css('cursor', 'wait');
		$('<div id="ocp_ui_wait_overlay"/>').appendTo('body').css({
			position: 'absolute',
			top: '0px',
			left: '0px',
			height: '100%',
			width: '100%',
			'background-color': 'white',
			opacity: '0',
			filter: 'alpha(opacity = 0)',
			cursor: 'wait !important',
			'z-index': '9999',
		});
		console.log('end cursor_wait_start');
	};

	ocp.ui.cursor_wait_end = function() {
		$('html, body').css('cursor', 'auto');
		$('#ocp_ui_wait_overlay').remove();
	};
})(ocp);
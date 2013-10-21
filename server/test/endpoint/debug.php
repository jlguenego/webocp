<?php
	define("SCRIPT_FILE", __FILE__);
	require_once(dirname(dirname(dirname(SCRIPT_FILE))) . '/include/header.inc');

	debug('coucou');
	debug_r('$_SERVER', $_SERVER);
?>
<?php
	sleep(2);
	define("SCRIPT_FILE", __FILE__);
	require_once(dirname(dirname(dirname(SCRIPT_FILE))) . '/include/header.inc');
?>

function hello() {
	console.log('hello');
}
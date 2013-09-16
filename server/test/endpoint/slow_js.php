<?php
	sleep(2);

	error_reporting(E_ERROR|E_WARNING|E_PARSE);
	header('Access-Control-Allow-Origin: *');
	header("Content-Type:application/javascript;");
?>

function hello() {
	console.log('hello');
}
<?php
	header('Access-Control-Allow-Origin: *');
	header("Content-Type:text/plain");
	define('ROOT', '../clt_root');
	//sleep(2);
	$dir = dir(ROOT.$_GET['path']);

	//List files in images directory
	while (($file = $dir->read()) !== false) {
		echo "filename: " . $file . "<br />";
	}

	$dir->close();
?>
[
	{
		"name": "hello",
		"label": "Hello",
		"type": "dir"
	},
	{
		"name": "world",
		"label": "World",
		"type": "dir"
	}
]
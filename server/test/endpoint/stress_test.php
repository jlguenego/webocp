<?php
	header( 'Content-Type: text/html; charset=utf-8' );

	for ($i = 0; $i < 10000; $i++) {
		$counter = file_get_contents('http://ocpforum.org/webocp/server/test/endpoint/counter.php');
		//$counter = file_get_contents('http://localhost/webocp/server/test/endpoint/counter.php');
		//$counter = 'coucou';
		echo $counter;
		echo " ";
		flush();
	    ob_flush();
	    usleep(10);
	}
?>
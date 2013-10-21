<?php
//	@ini_set('zlib.output_compression',0);
//	//@ini_set('implicit_flush',1);
//	@ini_set('output_buffering',0);
//	@ob_end_clean();
//	set_time_limit(0);
//	apache_setenv('no-gzip', 1);

	header( 'Content-type: text/html; charset=utf-8' );

	//ob_implicit_flush(true);
	//ob_end_flush();
	echo 'Begin ...<br />';
	for( $i = 0 ; $i < 5 ; $i++ )
	{
	    echo $i . '<br />';
	    echo str_repeat(' ',1024*64);
	    flush();
	    ob_flush();
	    sleep(1);
	}
	echo 'End ...<br />';
	//ob_start();
?>
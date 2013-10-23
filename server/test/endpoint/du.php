<?php
	header("Content-Type:text/plain; charset=UTF-8;");

	$result = exec('du -sb ' . '.');

	echo $result . PHP_EOL;
	print_r(preg_split("#\s+#", trim($result)));
?>
<?php

	header('Content-Type: application/json');

	$frames = array();

	$dir = new DirectoryIterator("../frames/scene-2");
	foreach($dir as $file) {
	    if ($file->isFile()) {
	        $x++;
	    }
	}

	$frames["result"] = $x;


	echo json_encode($frames);

?>
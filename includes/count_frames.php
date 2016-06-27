<?php

	header('Content-Type: application/json');

	$directory = $_GET["directory"];
	$path = "../" . $directory;
	
	$frames = array();

	$dir = new DirectoryIterator($path);
	foreach($dir as $file) {
	    if ($file->isFile()) {
	        $x++;
	    }
	}

	$frames["result"] = $x;

	echo json_encode($frames);

?>
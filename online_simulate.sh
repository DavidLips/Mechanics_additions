#!/bin/bash
echo "Content-type: text/html"
echo ''

args=("$*")
IFS="&"
set -- $QUERY_STRING

array=($@)
for i in "${array[@]}"; do IFS="=" ; set -- $i; done


scenefile="../../../scenes/scene_file-2.json"
scene=`cat $scenefile` 
echo $scene | ./expand_scene.py | ./simulate $args
echo $scene
echo $scenefile




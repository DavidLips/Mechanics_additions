function addVolumeExclusionConstraint(){

	// load current input form data
	var json_scene = $.parseJSON($("#scene_data").val());

	// check if volume exclusion constraint is present
	for (var i = 0; i < json_scene.root.length; i++){
		if(json_scene.root[i].type == "VOLUME_EXCLUSION_CONSTRAINT"){
			volume_exclusion_constraint_index = i;
		}
	}

	if (typeof volume_exclusion_constraint_index != 'undefined'){
		// add a new input box
		var data = '<h3 id="h3-volume-exclusion">Volume Exclusion Constraint</h3>\
					<div class="force-input-box" id="volume-exclusion">\
				    		<input type="checkbox" id="volume-exclusion-box" value="check" checked="checked"> Active volume exclusion constraint<br>\
				    </div>'
	}
	else{
		// add a new input box
		var data = '<h3 id="h3-volume-exclusion">Volume Exclusion Constraint</h3>\
					<div class="force-input-box" id="volume-exclusion">\
				    		<input type="checkbox" id="volume-exclusion-box" value="check"> Active volume exclusion constraint<br>\
				    </div>'
	}

	$('#forces_accordion').append(data).accordion({
	collapsible: true,
	active: false,
	heightStyle: "content"
	});

	$('#forces_accordion').accordion("refresh");

	var volume_exclusion_constraint = {"type": "VOLUME_EXCLUSION_CONSTRAINT"};
	


	$('input[type=checkbox]').change(
    function(){
        if (this.checked) {

        	if (typeof volume_exclusion_constraint_index == 'undefined'){
        		json_scene.root.push(volume_exclusion_constraint);
            	volume_exclusion_constraint_index = json_scene.root.length-1;
        	}
        	else if(json_scene.root[volume_exclusion_constraint_index].type != "VOLUME_EXCLUSION_CONSTRAINT"){
        		json_scene.root[volume_exclusion_constraint_index].type = "VOLUME_EXCLUSION_CONSTRAINT"
        	}
            
        }
        if (!this.checked) {
            json_scene.root[volume_exclusion_constraint_index].type = ""
        }

        // update scene data
		$("#scene_data").val(JSON.stringify(json_scene, null, 1));
    });

}

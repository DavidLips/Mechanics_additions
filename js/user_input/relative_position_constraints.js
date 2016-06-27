
function addRelativePositionConstraint(force_number){

	// load current input form data
	var json_scene = $.parseJSON($("#scene_data").val());

	// retrieve all structure names
	var force_indexes = [];

	$('#forces_accordion').children('div').each(function(i, obj) {
    	force_indexes.push(parseInt(this.id.slice(-1)))
	});

	// find structure number 'gaps' (useful if structures have been removed)
	var gaps = [];
	for (var i = 1; i <= force_number; i++){
		
		if ($.inArray(i,force_indexes) == -1){
			gaps.push(i);
		}
	}

	// pick the lowest number 
	force_number = Math.min.apply(null, gaps);

	// add a new input box
	var data = '<h3 id="h3-forces-'+force_number+'">Relative position constraint</h3>\
				<div class="force-input-box" id="force-'+force_number+'">\
					<div id="force-input-'+force_number+'" class="relative-force-input"> \
			    		Struct 1 <select id="relative-force-structure1-'+force_number+'" class="relative-force-structure1"><option selected value="base">Select structure</option></select><br></br>\
			    		Offset 1 <input type="text" id="relative-force-s1x-'+force_number+'" class="rs-x" placeholder="x" />&nbsp; <input type="text" id="relative-force-s1y-'+force_number+'" class="rs-y" placeholder="y"/>\
						&nbsp; <input type="text" id="relative-force-s1z-'+force_number+'" class="rs-z" placeholder="z"/><br></br>\
			    		Struct 2 <select id="relative-force-structure2-'+force_number+'" class="relative-force-structure2"><option selected value="base">Select structure</option></select><br></br>\
			    		Offset 2 <input type="text" id="relative-force-s2x-'+force_number+'" class="rs-x" placeholder="x" />&nbsp; <input type="text" id="relative-force-s2y-'+force_number+'" class="rs-y" placeholder="y"/>\
			    		&nbsp; <input type="text" id="relative-force-s2z-'+force_number+'" class="rs-z" placeholder="z"/><br></br>\
			    		Distance <input type="text" id="relative-force-distance-'+force_number+'" class="rs-x placeholder="10"/><br>\
			    		<input type="button" id="remove-force-'+force_number+'" class="remove_force" value="remove constraint"/>\
			    	</div>\
			    </div>'


	$('#forces_accordion').append(data).accordion({
	collapsible: true,
	active: false,
	heightStyle: "content"
	});

	$('#forces_accordion').accordion("refresh");

	// retrieve all structure names
	var structure_names = [];

	for (var i = 0; i < json_scene.root.length; i++){
		if (json_scene.root[i].type == "RIGID_STRUCTURE"){
			structure_names.push(json_scene.root[i].name);
		}
	}

	// add structure names as options
	for (var field in structure_names) {
	    $('<option value="'+ structure_names[field] +'">' +structure_names[field] + '</option>').appendTo('#relative-force-structure1-'+force_number);
	    $('<option value="'+ structure_names[field] +'">' +structure_names[field] + '</option>').appendTo('#relative-force-structure2-'+force_number);
	}

	// check if relative position constraint object exists
	for(var i = 0; i < json_scene.root.length; i++){
		if (json_scene.root[i].type == "RELATIVE_POSITION_CONSTRAINT"){
			relative_constraint_root_index = i;
		}
	}

	// if it doesn't exist
	if (typeof relative_constraint_root_index == 'undefined'){
		var relative_position_constraint = {"type": "RELATIVE_POSITION_CONSTRAINT",
											"constraints": []};
		json_scene.root.push(absolute_position_constraint);
		relative_constraint_root_index = json_scene.root.length - 1;
	};

	// create relative constraint object
	var relative_position_constraint = {
		"structure1": "",
		"offset1": [0,0,0],
		"structure2": "",
		"offset2": [0,0,0],
		"distance": 0,
		"force_index": force_number}

	json_scene.root[relative_constraint_root_index].constraints.push(relative_position_constraint)

	// update scene data
	$("#scene_data").val(JSON.stringify(json_scene, null, 1));

	// add pdb clicked
	$(document).one("click", "#remove-force-"+force_number, function(){

		// load current input form data
		var json_scene = $.parseJSON($("#scene_data").val());

		removeRelativePositionConstraint(force_number,json_scene);
	});

	registerRelativePositionInput(force_number)
}

function registerRelativePositionInput(force_number){


	$(document).on("change", "#relative-force-structure1-"+force_number, function(){
		updateRelativeConstraintFromInput(force_number,"structure1",0, "x");
    });
    $(document).on("keyup", "#relative-force-s1x-"+force_number, function(){
		updateRelativeConstraintFromInput(force_number,"offset1",0, "x");
    });
    $(document).on("keyup", "#relative-force-s1y-"+force_number, function(){
		updateRelativeConstraintFromInput(force_number,"offset1",1, "y");
    });
    $(document).on("keyup", "#relative-force-s1z-"+force_number, function(){
		updateRelativeConstraintFromInput(force_number,"offset1",2, "z");
    });
    $(document).on("change", "#relative-force-structure2-"+force_number, function(){
		updateRelativeConstraintFromInput(force_number,"structure2",0, "x");
    });
    $(document).on("keyup", "#relative-force-s2x-"+force_number, function(){
		updateRelativeConstraintFromInput(force_number,"offset2",0, "x");
    });
    $(document).on("keyup", "#relative-force-s2y-"+force_number, function(){
		updateRelativeConstraintFromInput(force_number,"offset2",1, "y");
    });
    $(document).on("keyup", "#relative-force-s2z-"+force_number, function(){
		updateRelativeConstraintFromInput(force_number,"offset2",2, "z");
    });
    $(document).on("keyup", "#relative-force-distance-"+force_number, function(){
		updateRelativeConstraintFromInput(force_number,"distance",2, "z");
    });
}

function updateRelativeConstraintFromInput(force_number, attribute, pos, axis){


	// load current input form data
	var json_scene = $.parseJSON($("#scene_data").val());

	var constraint_index = findRootIndex(force_number, json_scene, "relative_constraint");
	
	// pdate position
	if (attribute == "structure1"){
		console.log("relative structure clicked")
    	json_scene.root[relative_constraint_root_index].constraints[constraint_index].structure1 = $("#relative-force-structure1-"+force_number).val();
	}
	else if(attribute == "offset1"){
		json_scene.root[relative_constraint_root_index].constraints[constraint_index].offset1[pos] = parseFloat($("#relative-force-s1"+axis+"-"+force_number).val());
	}
	if (attribute == "structure2"){
    	json_scene.root[relative_constraint_root_index].constraints[constraint_index].structure2 = $("#relative-force-structure2-"+force_number).val();
	}
	else if(attribute == "offset2"){
		json_scene.root[relative_constraint_root_index].constraints[constraint_index].offset2[pos] = parseFloat($("#relative-force-s2"+axis+"-"+force_number).val());
	}
	else if(attribute == "distance"){
		json_scene.root[relative_constraint_root_index].constraints[constraint_index].distance = parseFloat($("#relative-force-distance-"+force_number).val());
	}

	// update scene data
	$("#scene_data").val(JSON.stringify(json_scene, null, 1));

	// expand and preview
	expanded_scene = expandScene($("#scene_data").val());
	preview(expanded_scene);
}


function removeRelativePositionConstraint(force_number, json_scene){

	var constraint_index = findRootIndex(force_number, json_scene, "relative_constraint");

	// remove structure from json
	json_scene.root[relative_constraint_root_index].constraints.splice(constraint_index, 1);
	force_counter--;

	// remove input element
	$("#force-"+force_number).remove(); 
	$("#forces_accordion").children("#h3-forces-"+force_number).remove();
	$("#forces_accordion").accordion("refresh");

	// update scene data
	$("#scene_data").val(JSON.stringify(json_scene, null, 1));

	// expand and preview
	expanded_scene = expandScene($("#scene_data").val());
	preview(expanded_scene);
}

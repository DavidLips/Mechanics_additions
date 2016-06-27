function addAbsolutePositionConstraint(force_number){

	// load current input form data
	var json_scene = $.parseJSON($("#scene_data").val());

	// retrieve all force indexes
	var force_indexes = [];

	$('#forces_accordion').children('div').each(function(i, obj) {
    	force_indexes.push(parseInt(this.id.slice(-1)))
	});

	// find force index 'gaps' (useful if structures have been removed)
	var gaps = [];
	for (var i = 1; i <= force_number; i++){
		
		if ($.inArray(i,force_indexes) == -1){
			gaps.push(i);
		}
	}

	// pick the lowest number 
	force_number = Math.min.apply(null, gaps);

	// add a new input box
	var data = '<h3 id="h3-forces-'+force_number+'">Absolute position constraint</h3>\
				<div class="force-input-box" id="force-'+force_number+'">\
					<div id="force-input-'+force_number+'" class="absolute-force-input"> \
			    		Structure <select id="force-structure-'+force_number+'" class="absolute-force-structure"><option selected value="base">Select structure</option></select><br></br>\
			    		Type <select id="force-type-'+force_number+'" class="force-type">\
			    		<option selected value="base">Select constraint</option><option value="linear">Linear</option><option value="angular">Angular</option></select>\
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
	    $('<option value="'+ structure_names[field] +'">' +structure_names[field] + '</option>').appendTo('#force-structure-'+force_number);
	}

	// check if ansolute position constraint object exists
	for(var i = 0; i < json_scene.root.length; i++){
		if (json_scene.root[i].type == "ABSOLUTE_POSITION_CONSTRAINT"){
			absolute_constraint_root_index = i;
		}
	}

	// if it doesn't exist, create it
	if (typeof absolute_constraint_root_index == 'undefined'){
		var absolute_position_constraint = {"type": "ABSOLUTE_POSITION_CONSTRAINT",
											"constraints": []};
		json_scene.root.push(absolute_position_constraint);
		absolute_constraint_root_index = json_scene.root.length - 1;
	};

	// update scene data
	$("#scene_data").val(JSON.stringify(json_scene, null, 1));

	// register change of structure and type selections
	$(document).on("change", "#force-structure-"+force_number, function(){

		var type = $("#force-type-"+force_number).val();
		var structure = $("#force-structure-"+force_number).val();

		if(type != "base" &&  structure != "base"){
			createAbsolutePositionConstraint(force_number, structure, type)
		}
    });
    $(document).on("change", "#force-type-"+force_number, function(){

    	var structure = $("#force-structure-"+force_number).val();
		var type = $("#force-type-"+force_number).val();

		if(type != "base" &&  structure != "base"){
			createAbsolutePositionConstraint(force_number, structure, type)
		}
    });

    // remove force 
	$(document).one("click", "#remove-force-"+force_number, function(){

		console.log("removal clicked")

		

		removeAbsolutePositionConstraint(force_number);
	});
}

function createAbsolutePositionConstraint(force_number, structure, type){

	// load current input form data
	var json_scene = $.parseJSON($("#scene_data").val());

	if (type=="linear"){

		// update input box
    	var forceBoxDiv = $(document.createElement('div')).attr("id", 'linear-abs-constraint-box-'+force_number);

    	$("#force-input-"+force_number).remove()

		forceBoxDiv.after().html('Linear position constraint: '+structure+' <br><br>'
									+'direction <input type="text" id="linear-force-x-'+force_number+'" class="rs-x" placeholder="x" />&nbsp; <input type="text" id="linear-force-y-'+force_number+'" class="rs-y" placeholder="y"/>'
									+' &nbsp; <input type="text" id="linear-force-z-'+force_number+'" class="rs-z" placeholder="z"/>' 
									+'     magnitude  <input type="text" id="linear-force-magnitude-'+force_number+'" class="magnitude" placeholder="0"/>'
									+'<br><input type="button" id="remove-force-'+force_number+'" class="remove_force" value="remove constraint"/>');
	            
		forceBoxDiv.appendTo("#force-"+force_number);

		
		var linear_absolute_position_constraint = {
			"type": "linear",
			"structure": structure,
			"direction": [0,0,0],
			"magnitude": 0,
			"force_index": force_number}


		json_scene.root[absolute_constraint_root_index].constraints.push(linear_absolute_position_constraint)

		// update scene data
		$("#scene_data").val(JSON.stringify(json_scene, null, 1));

		registerAbsolutePositionInput(force_number)


	}	
	else if(type=="angular"){

		// update input box
    	var forceBoxDiv = $(document.createElement('div')).attr("id", 'angular-abs-constraint-box-'+force_number);

    	$("#force-input-"+force_number).remove()

		forceBoxDiv.after().html('Angular position constraint: '+structure+' <br><br>'
									+'axis <input type="text" id="angular-force-x-'+force_number+'" class="rs-x" placeholder="x" />&nbsp; <input type="text" id="angular-force-y-'+force_number+'" class="rs-y" placeholder="y"/>'
									+'&nbsp; <input type="text" id="angular-force-z-'+force_number+'" class="rs-z" placeholder="z"/>' 
									+'       angle (degrees)  <input type="text" id="angular-force-angle-'+force_number+'" class="magnitude" placeholder="0"/>'
									+'<br><input type="button" id="remove-force-'+force_number+'" class="remove_force" value="remove constraint"/>');
	            
		forceBoxDiv.appendTo("#force-"+force_number);

		var angular_absolute_position_constraint = {
			"type": "angular",
			"structure": structure,
			"orientation": {
				"angle": 0,
				"axis": [0,0,0]
			},
			"force_index": force_number}


		json_scene.root[absolute_constraint_root_index].constraints.push(angular_absolute_position_constraint)

		// update scene data
		$("#scene_data").val(JSON.stringify(json_scene, null, 1));

		registerAbsolutePositionInput(force_number)
	}
}

function registerAbsolutePositionInput(force_number){

	$(document).on("keyup", "#linear-force-x-"+force_number, function(){
		updateAbsoluteConstraintFromInput(force_number,"direction",0, "x");
    });
    $(document).on("keyup", "#linear-force-y-"+force_number, function(){
		updateAbsoluteConstraintFromInput(force_number,"direction",1, "y");
    });
    $(document).on("keyup", "#linear-force-z-"+force_number, function(){
		updateAbsoluteConstraintFromInput(force_number,"direction",2, "z");
    });
    $(document).on("keyup", "#linear-force-magnitude-"+force_number, function(){
		updateAbsoluteConstraintFromInput(force_number,"magnitude",2, "z");
    });
    $(document).on("keyup", "#angular-force-x-"+force_number, function(){
		updateAbsoluteConstraintFromInput(force_number,"axis",0, "x");
    });
    $(document).on("keyup", "#angular-force-y-"+force_number, function(){
		updateAbsoluteConstraintFromInput(force_number,"axis",1, "y");
    });
    $(document).on("keyup", "#angular-force-z-"+force_number, function(){
		updateAbsoluteConstraintFromInput(force_number,"axis",2, "z");
    });
    $(document).on("keyup", "#angular-force-angle-"+force_number, function(){
		updateAbsoluteConstraintFromInput(force_number,"angle",2, "z");
    });
}

function updateAbsoluteConstraintFromInput(force_number, attribute, pos, axis){


	// load current input form data
	var json_scene = $.parseJSON($("#scene_data").val());

	var constraint_index = findRootIndex(force_number, json_scene, "absolute_constraint");
	
	// pdate position
	if (attribute == "direction"){
    	json_scene.root[absolute_constraint_root_index].constraints[constraint_index].direction[pos] = parseFloat($("#linear-force-"+axis+"-"+force_number).val());
	}
	else if(attribute == "magnitude"){
		json_scene.root[absolute_constraint_root_index].constraints[constraint_index].magnitude = parseFloat($("#linear-force-magnitude-"+force_number).val());
	}
	else if(attribute == "axis"){
		json_scene.root[absolute_constraint_root_index].constraints[constraint_index].orientation.axis[pos] = parseFloat($("#angular-force-"+axis+"-"+force_number).val());
	}
	else if(attribute == "angle"){
		json_scene.root[absolute_constraint_root_index].constraints[constraint_index].orientation.angle = parseFloat($("#angular-force-angle-"+force_number).val());
	}

	// update scene data
	$("#scene_data").val(JSON.stringify(json_scene, null, 1));

	// expand and preview
	expanded_scene = expandScene($("#scene_data").val());
	preview(expanded_scene);
}

function removeAbsolutePositionConstraint(force_number, json_scene){

	// load current input form data
	var json_scene = $.parseJSON($("#scene_data").val());

	var constraint_index = findRootIndex(force_number, json_scene, "absolute_constraint");

	// remove structure from json
	json_scene.root[absolute_constraint_root_index].constraints.splice(constraint_index, 1);
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
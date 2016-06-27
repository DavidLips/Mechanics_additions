/////////////////////////////////////
// Structure stuff

function addStructure(struct_counter){

	// load current input form data
	var json_scene = $.parseJSON($("#scene_data").val());

	// retrieve all structure names
	var structure_indexes = [];

	for (var i = 0; i < json_scene.root.length; i++){

		if (json_scene.root[i].type == "RIGID_STRUCTURE" && json_scene.root[i].name.slice(0,5) == "struc"){
			
				structure_indexes.push(parseInt(json_scene.root[i].name.slice(-1)));
		}
	}

	// find structure number 'gaps' (useful if structures have been removed)
	var gaps = [];
	for (var i = 1; i <= struct_counter; i++){
		
		if ($.inArray(i, structure_indexes) == -1){
			gaps.push(i);
		}

	}

	// pick the lowest number 
	min = Math.min.apply(null, gaps)

	// add to index
	structure_indexes.unshift(min);

	// sort so that tabs appear in numerical order
	structure_indexes.sort(sortNumber);

	// add a new input box
	var data = [];
	// for (var j = 0; j < structure_indexes.length; j++){

	// 	i = structure_indexes[j];

	// 	data.push('<h3 id="h3-'+i+'">Structure '+i+'</h3>\
	// 				<div class="structure_input" id="structure-'+i+'">\
	// 			    Position <input type="text" id="rs-x-'+i+'" class="rs-x" placeholder="x" />&nbsp; <input type="text" id="rs-y-'+i+'" class="rs-y" placeholder="y"/>\
	// 			    &nbsp; <input type="text" id="rs-z-'+i+'" class="rs-z" placeholder="z"/> <br><br>Radius <input type="text" id="rs-radius-'+i+'" class="rs-radius" placeholder="2"/><br></br>\
	// 			    Capsule extent <input type="text" id="rs-collision-'+i+'" class="rs-collision" placeholder="1.5"/><br></br>\
	// 			    <input type="button" id="remove-structure-'+i+'" class="remove-structure" value="remove structure"/>\
	// 			    </div>');
	// }

	// update accordion (refresh function automatically opens the first accordion tab, so we're creating/destroying everything from scratch each time we add a structure)
	// if ($('#structure_accordion').hasClass('ui-accordion')) {
 //            $('#structure_accordion').accordion('destroy');
 //    }
 //    $('#structure_accordion').empty().append(data).accordion({
 //        collapsible: true,
 //        active: false,
 //        heightStyle: "content"
 //    });

 	i=min;

 	data.push('<h3 id="custom-h3-'+i+'">Structure '+i+'</h3>\
					<div class="structure_input" id="structure-'+i+'">\
				    Position <input type="text" id="rs-x-'+i+'" class="rs-x" placeholder="x" />&nbsp; <input type="text" id="rs-y-'+i+'" class="rs-y" placeholder="y"/>\
				    &nbsp; <input type="text" id="rs-z-'+i+'" class="rs-z" placeholder="z"/> <br><br>Radius <input type="text" id="rs-radius-'+i+'" class="rs-radius" placeholder="2"/><br></br>\
				    Capsule extent <input type="text" id="rs-collision-'+i+'" class="rs-collision" placeholder="1.5"/><br></br>\
				    <input type="button" id="remove-structure-'+i+'" class="remove-structure" value="remove structure"/>\
				    </div>');

 	$('#structure_accordion').append(data).accordion({
        collapsible: true,
        active: false,
        heightStyle: "content"
    });

    $('#structure_accordion').accordion("refresh");

    // generate a new (default) structure
	var user_generated_structure = {
		"type": "RIGID_STRUCTURE",
		"position": [1 + min * 3, 1, 1],
		"radius": 1,
		"capsule_extent": 0.6,
		"name": "structure-"+min 
	};

	// add new structure to scene form
	json_scene.root.push(user_generated_structure);

	// replace input form data with updated scene
	$("#scene_data").val(JSON.stringify(json_scene, null, 1));

	// add structure as option to linker input box
	if ($("#input_container").find(".linker_input").length > 0 && $("#input_container").find(".linker-s1 option[value=structure-"+min+"]").length <= 0){ 
  		$('<option value="'+ user_generated_structure.name +'">' + user_generated_structure.name + '</option>').appendTo('.linker-s1');
  		$('<option value="'+ user_generated_structure.name +'">' + user_generated_structure.name + '</option>').appendTo('.linker-s2');
	}
	// add structure as option to absolute constraint box
	if ($("#input_container").find(".absolute-force-input").length > 0){ 
  		$('<option value="'+ user_generated_structure.name +'">' + user_generated_structure.name + '</option>').appendTo('.absolute-force-structure');
	}	
	// add structure as option to relative constraint box
	if ($("#input_container").find(".relative-force-input").length > 0){ 
  		$('<option value="'+ user_generated_structure.name +'">' + user_generated_structure.name + '</option>').appendTo('.relative-force-structure1');
  		$('<option value="'+ user_generated_structure.name +'">' + user_generated_structure.name + '</option>').appendTo('.relative-force-structure2');
	}	

	// listen for removal
	$(document).on("click", "#remove-structure-"+min, function(){ 

		// load current input form data
		var json_scene = $.parseJSON($("#scene_data").val());

		// retrieve structure index
		var structure_index = $(this).parent('div').attr("id").slice(-1);

		// remove structure
		removeStructure(structure_index, json_scene)
    })

    // expand and preview
	expanded_scene = expandScene($("#scene_data").val());
	preview(expanded_scene);

    // listen for user input
	registerStructureInput(min);
}




function updateStructureFromInput(structure_index, attribute, pos=0, axis){

	// load current input form data
	var json_scene = $.parseJSON($("#scene_data").val());

	var index = findRootIndex(structure_index, json_scene, "structure");

	// update position
	if (attribute == "position"){
    	json_scene.root[index].position[pos] = parseFloat($("#rs-"+axis+"-"+structure_index).val());
	}
	else if(attribute == "radius"){
		 json_scene.root[index].radius = parseFloat($("#rs-radius-"+structure_index).val());
	}
	else if(attribute == "collision_extent"){
		json_scene.root[index].collision_extent = parseFloat($("#rs-collision-"+structure_index).val());
	}
	else if(attribute == "capsule_extent"){
		json_scene.root[index].capsule_extent = parseFloat($("#rs-collision-"+structure_index).val());
	}

	// update scene data
	$("#scene_data").val(JSON.stringify(json_scene, null, 1));

	// expand and preview
	expanded_scene = expandScene($("#scene_data").val());
	preview(expanded_scene);

}

function registerStructureInput(i){

	$(document).on("keyup", "#rs-x-"+i, function(){
		updateStructureFromInput(i,"position",0, "x");
    });
    $(document).on("keyup", "#rs-y-"+i, function(){
		updateStructureFromInput(i,"position",1, "y");
    });
    $(document).on("keyup", "#rs-z-"+i, function(){
		updateStructureFromInput(i,"position",2, "z");
    });
    $(document).on("keyup", "#rs-radius-"+i, function(){
		updateStructureFromInput(i,"radius");
    });
    $(document).on("keyup", "#rs-collision-"+i, function(){
		updateStructureFromInput(i,"capsule_extent");
    });
}

function removeStructure(structure_index, json_scene){

	
	var root_index = findRootIndex(structure_index, json_scene, "structure");

	var name = json_scene.root[root_index].name;

	var keep_going = true;

	// remove linker if it exists and binds the removed structure
	if ($("#input_container").find(".linker_input").length > 0){ 

		$(".linker_input").each(function(index) {
			if ($("#linker-s1-"+(index+1)).val() == name && ( $("#linker-s2-"+(index+1)).val() != "base" && $("#linker-s2-"+(index+1)).val() != name ) ||
				$("#linker-s2-"+(index+1)).val() == name && ( $("#linker-s1-"+(index+1)).val() != "base" && $("#linker-s1-"+(index+1)).val() != name ) )
			{
				json_scene.root.splice(root_index, 1);
				structure_counter--;

				$("#rs-x-"+structure_index).parent('div').remove(); 
				$("#structure_accordion").children("#custom-h3-"+structure_index).remove();

				removeLinker(index+1, json_scene)			
				
				keep_going = false;
			}
		});
	}


	if (keep_going == false){
		return;
	}

	// remove structure from json
	json_scene.root.splice(root_index, 1);
	structure_counter--;

	// remove input element
	$("#rs-x-"+structure_index).parent('div').remove(); 
	$("#structure_accordion").children("#custom-h3-"+structure_index).remove();
	$("#structure_accordion").accordion("refresh");

	// remove structure option from linker boxes
	$("option[value='structure-"+structure_index+"']").remove();

	// update scene data
	$("#scene_data").val(JSON.stringify(json_scene, null, 1));

	// expand and preview
	expanded_scene = expandScene($("#scene_data").val());
	preview(expanded_scene);

}
////////////////////////////////////////
// PDB Stuff

function addPdbStructure(box_counter){

	// retrieve all structure names
	var pdb_indexes = [];

	$('#structure_accordion').children('div').each(function(i, obj) {
		if(obj.id.slice(0,3)=="pdb"){
			pdb_indexes.push(parseInt(this.id.slice(-1)))
		}
	});

	// find structure number 'gaps' (useful if structures have been removed)
	var gaps = [];
	for (var i = 1; i <= box_counter; i++){
		
		if ($.inArray(i,pdb_indexes) == -1){
			gaps.push(i);
		}
	}

	// pick the lowest number 
	var new_box_number = Math.min.apply(null, gaps);

	console.log(new_box_number)


	// add a new input box
	var data = '<h3 id="h3-pdb-'+new_box_number+'">PDB structure</h3>\
				<div class="pdb_input" id="pdb-structure-'+new_box_number+'">\
					<div id="pdb-input-'+new_box_number+'"> \
			    		PDB code <input type="text" id="pdb-name-'+new_box_number+'" class="pdb-name" placeholder="e.g. 1FAT"/>\
			    		<br></br><input type="button" id="find-pdb-button-'+new_box_number+'" class="find-pdb-button" value="Find PDB"/>\
			    	</div>\
			    </div>'
	

    $('#structure_accordion').append(data).accordion({
        collapsible: true,
        active: false,
        heightStyle: "content"
    });

    $('#structure_accordion').accordion("refresh");

    // add pdb clicked
    $(document).one("click", "#find-pdb-button-"+new_box_number, function(){

    	// load current input form data
		var json_scene = $.parseJSON($("#scene_data").val());

		var pdb_values = {};
		var pdb_name =$("#pdb-name-"+new_box_number).val();
		var pdb_struct_counter = 1

		for (var i = 0; i < json_scene.root.length; i++){

			if (json_scene.root[i].type == "RIGID_STRUCTURE" && json_scene.root[i].name.slice(0,4) == pdb_name){
				pdb_struct_counter++;
			}
		}

		var pdb_name_number = pdb_name+"-"+pdb_struct_counter; 

    	$.ajax({
		    url: "http://localhost/cgi-bin/Mechanics/bin/test_pdb_conversion.py",
		    type: "post",
		    async: false,
		    contentType: "application/json",
		    dataType: "json",
		    data: JSON.stringify({'struct': pdb_name}),
		    success: function(response){
		    	console.log("retrieving: ", pdb_name)
		    	pdb_values[pdb_name] = response
		    },
		    fail: function(){
		    	console.log('error during pdb retrieval');
		    }
		});

    	// update input box
    	var PdbBoxDiv = $(document.createElement('div')).attr("id", 'pdb-box-'+pdb_name_number);

    	$("#pdb-input-"+new_box_number).remove()
    	$("#h3-pdb-"+new_box_number).html('<span class="ui-accordion-header-icon ui-icon ui-icon-triangle-1-s"></span>'+pdb_name +" ("+pdb_struct_counter+")");

		PdbBoxDiv.after().html(pdb_name + '<br><br>position <input type="text" id="pdb-x-'+pdb_name_number+'" class="rs-x" placeholder="x" />&nbsp; <input type="text" id="pdb-y-'+pdb_name_number+'" class="rs-y" placeholder="y"/>'
									+' &nbsp; <input type="text" id="pdb-z-'+pdb_name_number+'" class="rs-z" placeholder="z"/>' 
									+'<br><br><input type="button" id="remove-pdb-'+pdb_name_number+'" class="remove-structure" value="remove structure"/>');
	            
		PdbBoxDiv.appendTo("#pdb-structure-"+new_box_number);

		
		 // generate a new (default) structure
		var pdb_structure = {
			"type": "RIGID_STRUCTURE",
			"position": [1 + pdb_struct_counter * 3, 1 + pdb_struct_counter * 3, 1],
			"radius": pdb_values[pdb_name].radius,
			"capsule_extent": pdb_values[pdb_name].collision_extent,
			"name": pdb_name_number
		};

		// add structure name to linker input box if it exists
		if ($("#input_container").find(".linker_input").length > 0 && $("#input_container").find(".linker-s1 option[value='"+pdb_name_number+"']").length <= 0){ 
	  		$('<option value="'+ pdb_name_number +'">' + pdb_name_number + '</option>').appendTo('.linker-s1');
	  		$('<option value="'+ pdb_name_number +'">' + pdb_name_number + '</option>').appendTo('.linker-s2');
		}	

		 // add pdb clicked
    	$(document).one("click", "#remove-pdb-"+pdb_name_number, function(){

    		// load current input form data
			var json_scene = $.parseJSON($("#scene_data").val());

			// retrieve structure index
			var structure_index = $(this).parent('div').parent('div').attr("id").slice(-1);

    		removePDB(structure_index,pdb_name_number, json_scene);
    	});

		// add new structure to scene form
		json_scene.root.push(pdb_structure);

		// replace input form data with updated scene
		$("#scene_data").val(JSON.stringify(json_scene, null, 1));

		// expand and preview
		expanded_scene = expandScene($("#scene_data").val());
		preview(expanded_scene);

		 // listen for user input
		registerPdbInput(pdb_name_number);
    });
}


function removePDB(structure_index, pdb_name_number, json_scene){

	var root_index = findRootIndex(0, json_scene, "pdb", pdb_name_number);

	var name = json_scene.root[root_index].name;

	var keep_going = true;

	// remove linker if it exists and binds the removed structure
	if ($("#input_container").find(".linker_input").length > 0){ 

		$(".linker_input").each(function(index) {
			if ($("#linker-s1-"+(index+1)).val() == name && ( $("#linker-s2-"+(index+1)).val() != "base" && $("#linker-s2-"+(index+1)).val() != name ) ||
				$("#linker-s2-"+(index+1)).val() == name && ( $("#linker-s1-"+(index+1)).val() != "base" && $("#linker-s1-"+(index+1)).val() != name ) )
			{
				json_scene.root.splice(root_index, 1);
				pdb_box_counter--;

				$("#pdb-x-"+pdb_name_number).parent('div').parent('div').remove(); 
				$("#structure_accordion").children("#h3-pdb-"+structure_index).remove();
				$("#structure_accordion").accordion("refresh");

				// remove structure option from linker boxes
				$("option[value='"+pdb_name_number+"']").remove();

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
	pdb_box_counter--;

	// remove input element
	$("#pdb-x-"+pdb_name_number).parent('div').parent('div').remove(); 
	$("#structure_accordion").children("#h3-pdb-"+structure_index).remove();
	$("#structure_accordion").accordion("refresh");

	// remove structure option from linker boxes
	$("option[value='"+pdb_name_number+"']").remove();

	// update scene data
	$("#scene_data").val(JSON.stringify(json_scene, null, 1));

	// expand and preview
	expanded_scene = expandScene($("#scene_data").val());
	preview(expanded_scene);
}


function registerPdbInput(pdb_name_number){

	$(document).on("keyup", "#pdb-x-"+pdb_name_number, function(){
		updatePdbFromInput(pdb_name_number, 0, "x");
    });
    $(document).on("keyup", "#pdb-y-"+pdb_name_number, function(){
		updatePdbFromInput(pdb_name_number,1, "y");
    });
    $(document).on("keyup", "#pdb-z-"+pdb_name_number, function(){
		updatePdbFromInput(pdb_name_number,2, "z");
    });
}

function updatePdbFromInput(pdb_name_number, pos=0, axis){

	// load current input form data
	var json_scene = $.parseJSON($("#scene_data").val());

	var index = findRootIndex(0, json_scene, "pdb", pdb_name_number);

	
   	json_scene.root[index].position[pos] = parseFloat($("#pdb-"+axis+"-"+pdb_name_number).val());
	
	// update scene data
	$("#scene_data").val(JSON.stringify(json_scene, null, 1));

	// expand and preview
	expanded_scene = expandScene($("#scene_data").val());
	preview(expanded_scene);

}
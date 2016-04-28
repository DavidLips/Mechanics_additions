function expandScene(json_scene){

	var expanded_scene

	$.ajax({
	    url: "http://localhost/cgi-bin/Mechanics/bin/ajax_expand_scene.py",
	    type: "post",
	    async: false,
	    contentType: "application/json",
	    dataType: "json",
	    data: json_scene,
	    success: function(response){
	        expanded_scene = response;
	    },
	    fail: function(){
	    	console.log('error during expanding scene');
	    }
	});;

	return expanded_scene;
}

function sortNumber(a,b) {
    return a - b;
}

//////////////////////////////////////
// Structure stuff

function addStructure(struct_counter){

	// load current input form data
	var json_scene = $.parseJSON($("#scene_data").val());

	// retrieve all structure names
	var structure_indexes = [];

	for (var i = 0; i < json_scene.root.length; i++){
		if (json_scene.root[i].type == "RIGID_STRUCTURE"){
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
	for (var j = 0; j < structure_indexes.length; j++){

		i = structure_indexes[j];

		data.push('<h3 id="h3-'+i+'">Structure '+i+'</h3>\
					<div class="structure_input" id="structure-'+i+'">\
				    position <input type="text" id="rs-x-'+i+'" class="rs-x" placeholder="x" />&nbsp; <input type="text" id="rs-y-'+i+'" class="rs-y" placeholder="y"/>\
				    &nbsp; <input type="text" id="rs-z-'+i+'" class="rs-z" placeholder="z"/> radius <input type="text" id="rs-radius-'+i+'" class="rs-radius" placeholder="2"/><br></br>\
				    collision extent <input type="text" id="rs-collision-'+i+'" class="rs-collision" placeholder="1.5"/>&nbsp; name <input type="text" id="rs-name-'+i+'" class="text-field" value="structure-'+i+'"/><br></br>\
				    <input type="button" id="remove-structure-'+i+'" class="remove-structure" value="remove structure"/>\
				    </div>');
	}

	// update accordion (refresh function automatically opens the first accordion tab, so we're creating/destroying everything from scratch each time we add a structure)
	if ($('#structure_accordion').hasClass('ui-accordion')) {
            $('#structure_accordion').accordion('destroy');
    }
    $('#structure_accordion').empty().append(data).accordion({
        collapsible: true,
        active: false,
        heightStyle: "content"
    });

    // generate a new (default) structure
	var user_generated_structure = {
		"type": "RIGID_STRUCTURE",
		"position": [1 + min * 3, 1, 1],
		"radius": 1,
		"collision_extent": 0.6,
		"name": "structure-"+min 
	};

	// add new structure to scene form
	json_scene.root.push(user_generated_structure);

	// replace input form data with updated scene
	$("#scene_data").val(JSON.stringify(json_scene, null, 1));

	// add structure name to linker input box if it exists
	if ($("#input_container").find(".linker_input").length > 0 && $("#input_container").find(".linker-s1 option[value=structure-"+min+"]").length <= 0){ 
  		$('<option value="'+ user_generated_structure.name +'">' + user_generated_structure.name + '</option>').appendTo('.linker-s1');
  		$('<option value="'+ user_generated_structure.name +'">' + user_generated_structure.name + '</option>').appendTo('.linker-s2');
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

    // listen for user input
	registerStructureInput(min);
}


function findRootIndex(index, json_scene, type, pdb_name=""){

	if (type == "structure"){
		var target = "structure-"+index
	}
	else if (type == "linker"){
		var target = "linker-"+index
	}
	else if(type== "pdb"){
		var target = pdb_name;
	}

	for(var i = 0; i < json_scene.root.length; i++){
		if (json_scene.root[i].name == target){
			return i;
		}
	}

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
		updateStructureFromInput(i,"collision_extent");
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
				$("#structure_accordion").children("#h3-"+structure_index).remove();

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
	$("#structure_accordion").children("#h3-"+structure_index).remove();
	$("#structure_accordion").accordion("refresh");

	// remove structure option from linker boxes
	$("option[value='structure-"+structure_index+"']").remove();

	// update scene data
	$("#scene_data").val(JSON.stringify(json_scene, null, 1));

	// expand and preview
	expanded_scene = expandScene($("#scene_data").val());
	preview(expanded_scene);

}


////////////////////////////////////////////////////////////////////////////////
// Linker stuff

function addLinkerInputBox(linker_counter){

	// collect current scene data
	var json_scene = $.parseJSON($("#scene_data").val());

	// retrieve all structure names
	var structure_names = [];

	for (var i = 0; i < json_scene.root.length; i++){
		if (json_scene.root[i].type == "RIGID_STRUCTURE"){
			structure_names.push(json_scene.root[i].name);
		}
	}

	// add a new input box
	var data = [];

	for (var i = 1; i <= linker_counter; i++){

		data.push('<h3 id="h3-'+i+'">Linker '+i+'</h3>\
					<div class="linker_input" id="linker-'+i+'">\
			        Struct 1 <select id="linker-s1-'+i+'" class="linker-s1">\
			        <option selected value="base">Select structure</option>\
			        </select>\
			        Struct 2 <select id="linker-s2-'+i+'" class="linker-s2">\
			        <option selected value="base">Select structure</option>\
			        </select>\
			        <br></br>\
			        offset 1 <input type="text" id="linker-s1x-'+i+'" class="linker-os1" placeholder="x" />\
			        &nbsp; <input type="text" id="linker-s1y-'+i+'" class="linker-os1" placeholder="y"/>\
			        &nbsp; <input type="text" id="linker-s1z-'+i+'" class="linker-os1" placeholder="z"/>\
			         offset 2 <input type="text" id="linker-s2x-'+i+'" class="linker-os2" placeholder="x" />\
			        &nbsp; <input type="text" id="linker-s2y-'+i+'" class="linker-os2" placeholder="y"/>\
			        &nbsp; <input type="text" id="linker-s2z-'+i+'" class="linker-os2" placeholder="z"/>\
			        <br></br>\
			        number of links <input type="text" id="linker-links-'+i+'" class="linker-links" placeholder="6"/>\
			        &nbsp; link radius <input type="text" id="linker-radius-'+i+'" class="linker-radius" placeholder="0.6"/>\
			        <br></br>\
			        link offset <input type="text" id="linker-lx-'+i+'" class="linker-ol" placeholder="x" />\
			        &nbsp; <input type="text" id="linker-ly-'+i+'" class="linker-ol" placeholder="y"/>\
			        &nbsp; <input type="text" id="linker-lz-'+i+'" class="linker-ol" placeholder="z"/>\
			        <br></br>\
			        <input type="button" id="remove_linker-'+i+'" class="remove_linker" value="remove linker"/>\
					</div>');

		
	}

	if ($('#linker_accordion').hasClass('ui-accordion')) {
            $('#linker_accordion').accordion('destroy');
    }
    $('#linker_accordion').empty().append(data).accordion({
        collapsible: true,
        active: false,
        heightStyle: "content"
    });

    // add structure names as options
    for (var j = 1; j <= linker_counter; j++){
		for (var field in structure_names) {
		    $('<option value="'+ structure_names[field] +'">' +structure_names[field] + '</option>').appendTo('#linker-s1-'+j);
		    $('<option value="'+ structure_names[field] +'">' +structure_names[field] + '</option>').appendTo('#linker-s2-'+j);
		}
	}

	// add listener for remove linker
	$(document).one("click", "#remove_linker-"+linker_counter, function(){ 

		// collect current scene data
		var json_scene = $.parseJSON($("#scene_data").val());

		// retrieve structure index
		var linker_index = $(this).attr("id").slice(-1);

		// remove structure
		removeLinker(linker_index, json_scene)
   		
    })
}

function removeLinker(linker_index, json_scene){

	
	var root_index = findRootIndex(linker_index, json_scene, "linker");

	if (root_index) {
		json_scene.root.splice(root_index, 1);
	}

	// update scene data
	$("#scene_data").val(JSON.stringify(json_scene, null, 1));

	$("#linker-s1-"+linker_index).parent('div').remove(); 
	$("#linker_accordion").children("#h3-"+linker_index).remove();
	$("#linker_accordion").accordion("refresh");

	linker_box_counter--;

	// expand and preview
	expanded_scene = expandScene($("#scene_data").val());
	preview(expanded_scene);

}

function addLinker(i, structure_1, structure_2) {

	// generate a new (default) linker
	var user_generated_linker = {
		"type": "FLEXIBLE_LINKER",
        "structure1": structure_1,
        "offset1": [-1.015,0,1.355],
        "structure2": structure_2,
        "offset2": [0,0,1.43],
        "links": 6,
        "link_radius": 0.2,
        "link_offset": [1.2,0,0],
        "name": "linker-"+i
    };

    // load current input form data
	var json_scene = $.parseJSON($("#scene_data").val());

	// add new linker
	json_scene.root.push(user_generated_linker);

	// replace input form data with updated scene
	$("#scene_data").val(JSON.stringify(json_scene, null, 1));

	// expand and preview
	expanded_scene = expandScene($("#scene_data").val());
	preview(expanded_scene);
}


function updateLinkerFromInput(linker_index, attribute, pos=0, axis="x",offset_index=0){
	
	// load current input form data
	var json_scene = $.parseJSON($("#scene_data").val());
	var root_index = findRootIndex(linker_index, json_scene, "linker");

	// update position
	if (attribute == "offsetS1"){
    	if (!isNaN(parseInt($("#linker-s"+offset_index+axis+"-"+linker_index).val()))){
    		json_scene.root[root_index].offset1[pos] = parseFloat($("#linker-s"+offset_index+axis+"-"+linker_index).val());
    	}
    	else{
    		json_scene.root[root_index].offset1[pos] = 0;
    	}    	
	}
	else if(attribute == "offsetS2"){
		if (!isNaN(parseInt($("#linker-s"+offset_index+axis+"-"+linker_index).val()))){
    		json_scene.root[root_index].offset2[pos] = parseFloat($("#linker-s"+offset_index+axis+"-"+linker_index).val());
    	}
    	else{
    		json_scene.root[root_index].offset2[pos] = 0;
    	}
	}
	else if(attribute == "offsetL"){
		if (!isNaN(parseInt($("#linker-l"+axis+"-"+linker_index).val()))){
    		json_scene.root[root_index].link_offset[pos] = parseFloat($("#linker-l"+axis+"-"+linker_index).val());
    	}
    	else{
    		json_scene.root[root_index].link_offset[pos] = 0;
    	}
	}
	else if(attribute == "radius"){
		 json_scene.root[root_index].link_radius = parseFloat($("#linker-radius-"+linker_index).val());
	}
	else if(attribute == "links"){
		json_scene.root[root_index].links = parseFloat($("#linker-links-"+linker_index).val());
	}
	else if(attribute == "structure-1"){

		// check if a linker for this box already exists
		var linker_exists = false;

		for (var i = 0; i < json_scene.root.length; i++){
			if (json_scene.root[i].name == "linker-"+linker_index){
				linker_exists = true;
			}
		}
		
		var linker_s1 = $("#linker-s1-"+linker_index).val()
		var linker_s2 = $("#linker-s2-"+linker_index).val()

		// if linker doesn't exist yet and both values are valid, create linker
		if (linker_exists == false && linker_s2 != "base" && linker_s2 != linker_s1 && linker_s1 != "base"){
    		addLinker(linker_index, linker_s1, linker_s2);
    		return;
    	}

    	// if linker already exists, update existing linker
    	if (linker_exists == true && linker_s1 != "base"){
			json_scene.root[root_index].structure1 = linker_s1;
		}
	}
	else if(attribute == "structure-2"){

		var linker_exists = false;

		for (var i = 0; i < json_scene.root.length; i++){
			if (json_scene.root[i].name == "linker-"+linker_index){
				linker_exists = true;
			}
		}
		
		var linker_s1 = $("#linker-s1-"+linker_index).val()
		var linker_s2 = $("#linker-s2-"+linker_index).val()

		if (linker_exists == false && linker_s2 != "base" && linker_s2 != linker_s1 && linker_s1 != "base"){
    		addLinker(linker_index, linker_s1, linker_s2);
    		return;
    	}

    	if (linker_exists == true && linker_s2 != "base"){
			json_scene.root[root_index].structure2 = linker_s2;
		}	
	}

	// update scene data
	$("#scene_data").val(JSON.stringify(json_scene, null, 1));

	// expand and preview
	expanded_scene = expandScene($("#scene_data").val());
	preview(expanded_scene);

}

function registerLinkerInput(i){

	$(document).on("keyup", "#linker-s1x-"+i, function(){
		updateLinkerFromInput(i, "offsetS1", 0,  "x",1);	
    });
    $(document).on("keyup", "#linker-s1y-"+i, function(){
		updateLinkerFromInput(i, "offsetS1", 1,"y",1);	
    });
    $(document).on("keyup", "#linker-s1z-"+i, function(){
		updateLinkerFromInput(i, "offsetS1", 2, "z",1);
    });
    $(document).on("keyup", "#linker-s2x-"+i, function(){
		updateLinkerFromInput(i, "offsetS2", 0, "x", 2);
    });
    $(document).on("keyup", "#linker-s2y-"+i, function(){
		updateLinkerFromInput(i, "offsetS2", 1, "y",2);
    });
    $(document).on("keyup", "#linker-s2z-"+i, function(){
		updateLinkerFromInput(i, "offsetS2", 2,"z",2);
    });
    $(document).on("keyup", "#linker-lx-"+i, function(){
		updateLinkerFromInput(i, "offsetL", 0,"x");
    });
    $(document).on("keyup", "#linker-ly-"+i, function(){
		updateLinkerFromInput(i, "offsetL", 1,"y");
    });
    $(document).on("keyup", "#linker-lz-"+i, function(){
		updateLinkerFromInput(i, "offsetL", 2, "z");
    });
    $(document).on("keyup", "#linker-radius-"+i, function(){
		updateLinkerFromInput(i, "radius");
    });
    $(document).on("keyup", "#linker-links-"+i, function(){
		updateLinkerFromInput(i,"links");
    });
    $(document).on("change", "#linker-s1-"+i, function(){
    	updateLinkerFromInput(i, "structure-1");
    });
    $(document).on("change", "#linker-s2-"+i, function(){
    	updateLinkerFromInput(i, "structure-2");
    });
}



////////////////////////////////////////
// PDB Stuff

function addPdbStructure(struct_counter){

	// load current input form data
	var json_scene = $.parseJSON($("#scene_data").val());

	// retrieve all structure names
	var pdb_indexes = [];

	$('.pdb_input').each(function(i, obj) {
    	pdb_indexes.push(parseInt($(this).attr('id').slice(-1)))
	});

	// find structure number 'gaps' (useful if structures have been removed)
	var gaps = [];
	for (var i = 1; i <= struct_counter; i++){
		
		if ($.inArray(i,pdb_indexes) == -1){
			gaps.push(i);
		}
	}

	// pick the lowest number 
	min = Math.min.apply(null, gaps)

	// add in front of the index array
	pdb_indexes.unshift(min);

	// sort so that tabs appear in numerical order
	pdb_indexes.sort(sortNumber);

	// add a new input box
	var data = [];
	for (var j = 0; j < pdb_indexes.length; j++){

		i = pdb_indexes[j];

		data.push('<h3 id="h3-pdb-'+i+'">PDB structure '+i+'</h3>\
					<div class="pdb_input" id="pdb-structure-'+i+'">\
						<div id="pdb-input-'+min+'"> \
				    		PDB code <input type="text" id="pdb-name-'+i+'" class="pdb-name" placeholder="e.g. 1FAT"/>\
				    		<input type="button" id="find-pdb-button-'+i+'" class="find-pdb-button" value="Find PDB"/>\
				    	</div>\
				    </div>');
	}

	// update accordion (refresh function automatically opens the first accordion tab, so we're creating/destroying everything from scratch each time we add a structure)
	if ($('#pdb_accordion').hasClass('ui-accordion')) {
            $('#pdb_accordion').accordion('destroy');
    }
    $('#pdb_accordion').empty().append(data).accordion({
        collapsible: true,
        active: false,
        heightStyle: "content"
    });


    // add pdb clicked
    $(document).on("click", "#find-pdb-button-"+min, function(){

		var pdb_values = {};
		var pdb_name =$("#pdb-name-"+min).val();
		var pdb_name_number = pdb_name+"("+min+")" 

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
		    	console.log(pdb_values)
		    },
		    fail: function(){
		    	console.log('error during pdb retrieval');
		    }
		});

    	var PdbBoxDiv = $(document.createElement('div')).attr("id", 'pdb-box-'+min);

    	$("#pdb-input-"+min).remove()
                
		PdbBoxDiv.after().html(pdb_name + '<br><br>position <input type="text" id="pdb-x-'+min+'" class="rs-x" placeholder="x" />&nbsp; <input type="text" id="pdb-y-'+min+'" class="rs-y" placeholder="y"/>'
									+' &nbsp; <input type="text" id="pdb-z-'+min+'" class="rs-z" placeholder="z"/>' 
									+'<br><br><input type="button" id="remove-pdb-'+min+'" class="remove-structure" value="remove structure"/>');
	            
		PdbBoxDiv.appendTo("#pdb-structure-"+min);

		
		 // generate a new (default) structure
		var pdb_structure = {
			"type": "RIGID_STRUCTURE",
			"position": [1 + min * 3, 1 + min * 3, 1],
			"radius": pdb_values[pdb_name].radius,
			"collision_extent": pdb_values[pdb_name].collision_extent,
			"name": pdb_name+"("+min+")" 
		};

		// add structure name to linker input box if it exists
		if ($("#input_container").find(".linker_input").length > 0 && $("#input_container").find(".linker-s1 option[value='"+pdb_name_number+"']").length <= 0){ 
	  		$('<option value="'+ pdb_name_number +'">' + pdb_name_number + '</option>').appendTo('.linker-s1');
	  		$('<option value="'+ pdb_name_number +'">' + pdb_name_number + '</option>').appendTo('.linker-s2');
		}	

		 // add pdb clicked
    	$(document).on("click", "#remove-pdb-"+min, function(){

    		// load current input form data
			var json_scene = $.parseJSON($("#scene_data").val());

			// retrieve structure index
			var structure_index = $(this).parent('div').attr("id").slice(-1);

			console.log($(this).parent('div').attr("id"))


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
		registerPDBstructureInput(min);
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
				pdb_counter--;

				$("#pdb-x-"+structure_index).parent('div').remove(); 
				$("#pdb_accordion").children("#h3-pdb-"+structure_index).remove();

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
	pdb_counter--;

	console.log(structure_index)

	// remove input element
	$("#pdb-x-"+structure_index).parent('div').remove(); 
	$("#pdb_accordion").children("#h3-pdb-"+structure_index).remove();
	$("#pdb_accordion").accordion("refresh");

	// remove structure option from linker boxes
	$("option[value='"+pdb_name_number+"']").remove();

	// update scene data
	$("#scene_data").val(JSON.stringify(json_scene, null, 1));

	// expand and preview
	expanded_scene = expandScene($("#scene_data").val());
	preview(expanded_scene);

}


////////////////////////////////////

$(function() {

	structure_counter = 1;
	linker_box_counter = 1;
	pdb_counter = 1;

	// add structure clicked
	$(document).on("click", "#add-custom-structure", function(){

		// add the structure
		addStructure(structure_counter);
	
		// expand and preview
		expanded_scene = expandScene($("#scene_data").val());
		preview(expanded_scene);

	    structure_counter++;
	});

	// add linker clicked
    $(document).on("click", "#add-linker", function(){

    	addLinkerInputBox(linker_box_counter);

    	// check for changes to input box
    	registerLinkerInput(linker_box_counter);

    	linker_box_counter++;
    });

    // add linker clicked
    $(document).on("click", "#add-pdb-structure", function(){

    	addPdbStructure(pdb_counter);

    	pdb_counter++;
    }); 
});


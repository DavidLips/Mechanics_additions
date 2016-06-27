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
			        <br><br>Struct 2 <select id="linker-s2-'+i+'" class="linker-s2">\
			        <option selected value="base">Select structure</option>\
			        </select>\
			        <br></br>\
			        offset 1 <input type="text" id="linker-s1x-'+i+'" class="linker-os1" placeholder="x" />\
			        &nbsp; <input type="text" id="linker-s1y-'+i+'" class="linker-os1" placeholder="y"/>\
			        &nbsp; <input type="text" id="linker-s1z-'+i+'" class="linker-os1" placeholder="z"/>\
			        <br><br>offset 2 <input type="text" id="linker-s2x-'+i+'" class="linker-os2" placeholder="x" />\
			        &nbsp; <input type="text" id="linker-s2y-'+i+'" class="linker-os2" placeholder="y"/>\
			        &nbsp; <input type="text" id="linker-s2z-'+i+'" class="linker-os2" placeholder="z"/>\
			        <br></br>\
			        number of links <input type="text" id="linker-links-'+i+'" class="linker-links" placeholder="6"/>\
			       	<br><br>link radius <input type="text" id="linker-radius-'+i+'" class="linker-radius" placeholder="0.6"/>\
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

    registerLinkerInput(linker_box_counter);

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


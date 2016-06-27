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
	else if(type == "absolute_constraint"){
		var target = index

		for(var i = 0; i < json_scene.root[absolute_constraint_root_index].constraints.length; i++){
			if(json_scene.root[absolute_constraint_root_index].constraints[i].force_index == target){
				return i;
			}
		}
	}
	else if(type == "relative_constraint"){
		var target = index

		for(var i = 0; i < json_scene.root[relative_constraint_root_index].constraints.length; i++){
			if(json_scene.root[relative_constraint_root_index].constraints[i].force_index == target){
				return i;
			}
		}
	}
	
	for(var i = 0; i < json_scene.root.length; i++){
		if (json_scene.root[i].name == target){
			return i;
		}
	}
}
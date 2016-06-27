

function countFrames(callback, output_directory){

	// find number of frames in frame folder
	$.ajax({
	    url: '../includes/count_frames.php',
	    dataType: 'json',
	    data: {"directory":output_directory},
	    async: false,
	    success: function(obj) {
			callback(obj.result);
	    },
	    error: function(e){
	    	console.log("couldn't count number of files in ")
	    }
	});
}


function updateForces(callback, forces, structures){

	for (var i = 0; i < forces.children.length; i++){

		// retrieve relevant structures and offsets
		s1 = forces.children[i].name[0];
		s2 = forces.children[i].name[1];
		n1 = forces.children[i].name[2];
		n2 = forces.children[i].name[3];

		n1_copy = n1.clone();
		n2_copy = n2.clone();

		updated_first_attachment = new THREE.Vector3();	
		updated_second_attachment = new THREE.Vector3();

		// rotate offset based on structure's current orientation	
		n1_copy.applyEuler(structures.getObjectByName(s1).rotation)
		n2_copy.applyEuler(structures.getObjectByName(s2).rotation)

		// add rotated offset to structure's center of mass
		updated_first_attachment.addVectors(structures.getObjectByName(s1).position, n1_copy);
		updated_second_attachment.addVectors(structures.getObjectByName(s2).position, n2_copy);

		callback(forces.children[i], updated_first_attachment, updated_second_attachment);
	}
}

function updateStructures(callback, index, structures, directory){

    $.ajax({
	  url: 'http://localhost/'+directory+'/frame.'+index,
	  async: false,
	  dataType: 'json',
	  success: function(frame_data) {

	  	for (var i = 0; i < structures.children.length; i++){

	  		frame_handle = frame_data.value2[0].ptr_wrapper.data.value0[i].ptr_wrapper.data

		  	// retrieve position
	    	var updated_position = frame_handle.frame.position.data

			// retrieve orientation
	    	var updated_orientation = frame_handle.frame.orientation.value0.data

    		callback(updated_position, updated_orientation, structures.getObjectByName(frame_handle.name) );
	    }
      },
      error: function(e){
      	console.log(e)
      }
	});
}

var animate = function(scene_data) {

	var scene = new THREE.Scene();

	createStructures(function (allStructures){
		structures = allStructures;
	}, scene_data);

	// create force lines
	var forces;
	createForces(function (force_lines){
		forces = force_lines;
	}, scene_data, structures);

	// add the structures and forces
	scene.add(structures);
	scene.add(forces);


	// count total frames
	var frame_total = 0;
	countFrames(function (frames){
		frame_total += frames;
	}, scene_data.output_directory);

	// prep animation
	var frame_index = 0;
	var orientation_quat = new THREE.Quaternion();
	var running = true;		

	function render() {

		if (running) {

			// update structures
			updateStructures(function (updated_position, updated_orientation, structure){

				// update position
				structure.position.x = updated_position[0];
				structure.position.y = updated_position[1];
				structure.position.z = updated_position[2];

				// set updated orientation
				orientation_quat.set(updated_orientation[0], updated_orientation[1], updated_orientation[2], updated_orientation[3]);

				// apply orientation to structure
				structure.rotation.setFromQuaternion(orientation_quat.normalize());

			}, frame_index, structures, scene_data.output_directory);

			// update force lines
			updateForces(function (force_line, updated_first_attachment, updated_second_attachment){

				force_line.geometry.vertices[0].copy(updated_first_attachment);
				force_line.geometry.vertices[1].copy(updated_second_attachment);
				force_line.geometry.verticesNeedUpdate = true;

			},forces, structures);

			// next frame
			frame_index += 1;

			// check for end of frames
			if (frame_index == frame_total-1){
				running = false;
			}

		}

		requestAnimationFrame(render);
		renderer.render(scene, camera);
		controls.update()
	};

	render();

	// reset for next preview
	scene_initialized=false;
};


$(function() {



	// let's try to simulate stuff
	$(document).on("click", "#simulate_button", function(){

		// expand and preview
		expanded_scene = expandScene($("#scene_data").val());
	
		$.ajax({
	    url: "http://localhost/cgi-bin/Mechanics/bin/online_simulate.py",
	    type: "POST",
	    async: false,
	    contentType: "application/text",
	    datatype: "json",
	    data: JSON.stringify(expanded_scene),
	    success: function(response){
	        console.log("analysis results: ", response);
	        animate(expanded_scene);
	    },
	    error: function(){
	    	console.log('error during simulating');
	    }
		});;



	})
});
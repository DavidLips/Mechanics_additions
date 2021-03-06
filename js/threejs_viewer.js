var initScene;

function readSceneData(callback, scene){

	$.ajax({
	  url: '../scenes/'+scene+'.json',
	  async: false,
	  dataType: 'json',
	  success: function(scene_data) {
	  	callback(scene_data)
	  }
	});
}

function createColor(i){

	var palette = ['rgb(51,204,255)', 'rgb(51,102,255)', 'rgb(51,255,204)', 'rgb(51,255,205)', 'rgb(0,138,184)'];

	var canvas = document.createElement( 'canvas' );
	canvas.width = 256;
	canvas.height = 256;

	var context = canvas.getContext( '2d' );
	//context.fillStyle = 'rgb(' + Math.floor( i*7 * 256 % 256) + ',' + Math.floor( i*7 * 256 %256 ) + ',' + Math.floor( i*5 * 256 %256) + ')'
	context.fillStyle = palette[i%5]
	context.fillRect( 0, 0, 256, 256 );

	return canvas;

}

function createStructures(callback, scene_data) {

	// object that holds all structures
	var structures = new THREE.Object3D();
	var linkers = new THREE.Object3D();

	for (var i = 0; i < scene_data.root.length; i++){

		if (scene_data.root[i].type == "RIGID_STRUCTURE"){

 			// extract radius and collision extent
			var radius = scene_data.root[i].radius;	
			var collision_extent = scene_data.root[i].collision_extent * 2;

			// capsules
			if (collision_extent > 0){

				// container object for capsule elements
				var merged = new THREE.Geometry();


				//texture test
				var texture = new THREE.CanvasTexture( createColor(i) );
				var proteinMaterial = new THREE.MeshBasicMaterial( { map: texture, wireframe: true } );
			
				// define cylinder and two spheres to create a capsule
				var cylinder = new THREE.CylinderGeometry(radius, radius,collision_extent, 24);
				var top = new THREE.SphereGeometry(radius,17);
				var bottom = new THREE.SphereGeometry(radius,17);

				// set position of bottom and top spheres
				var m1 = new THREE.Matrix4();
				m1.makeTranslation(0,collision_extent/2,0);
				top.applyMatrix(m1);

				var m2 = new THREE.Matrix4();
				m2.makeTranslation(0,-collision_extent/2,0);
				bottom.applyMatrix(m2);

				// add spheres and cylinder to merged object
				merged.merge(cylinder);
				merged.merge(bottom);
				merged.merge(top);

				// set proper orientation
				if(scene_data.root[i].orientation){

					var m3 = new THREE.Matrix4();
					radians = scene_data.root[i].orientation.angle * Math.PI / 180;

					if (scene_data.root[i].orientation.axis[0] == 1){
						m3.makeRotationX(radians);
					}
					if (scene_data.root[i].orientation.axis[1] == 1){
						m3.makeRotationY(radians);
					}
					if (scene_data.root[i].orientation.axis[2] == 1){
						m3.makeRotationZ(radians);
					}

					merged.applyMatrix(m3);

				}

				// create capsule
				var protein = new THREE.Mesh(merged, proteinMaterial);

				protein.position.x = scene_data.root[i].position[0]
				protein.position.y = scene_data.root[i].position[1]
				protein.position.z = scene_data.root[i].position[2]

				protein.name = scene_data.root[i].name

				structures.add(protein);
			}
			// spheres
			else{
				
				var linkerMaterial = new THREE.MeshBasicMaterial( {color: 0xCCFF33, wireframe: true});
				var linkerChainGeometry = new THREE.SphereGeometry(radius, 32, 32);
				var linkerChain = new THREE.Mesh(linkerChainGeometry, linkerMaterial);

				linkerChain.position.x = scene_data.root[i].position[0]
				linkerChain.position.y = scene_data.root[i].position[1]
				linkerChain.position.z = scene_data.root[i].position[2]

				linkerChain.name = scene_data.root[i].name;
				structures.add(linkerChain);
			}	
		}
	}
	callback(structures);	
}

function updateStructures(callback, index, structures){

    $.ajax({
	  url: '../frames/scene-2/frame.'+index,
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
      }
	});
}

function createForces(callback, scene_data, structures){

	var forces = new THREE.Object3D();

	if(forces.children.length >= 0){
	
		var material = new THREE.LineBasicMaterial({color: 0xff0000, linewidth: 1});

		// search for relative position constraints
		for (var i = 0; i < scene_data.root.length; i++){

			if (scene_data.root[i].type == "RELATIVE_POSITION_CONSTRAINT"){

				// loop over all constraints
				for (var j=0; j < scene_data.root[i].constraints.length; j++){

					// retrieve structures and offsets
					s1 = scene_data.root[i].constraints[j].structure1;
					s2 = scene_data.root[i].constraints[j].structure2;
					n1 = new THREE.Vector3(scene_data.root[i].constraints[j].offset1[0], scene_data.root[i].constraints[j].offset1[1], scene_data.root[i].constraints[j].offset1[2]);
					n2 = new THREE.Vector3(scene_data.root[i].constraints[j].offset2[0], scene_data.root[i].constraints[j].offset2[1], scene_data.root[i].constraints[j].offset2[2]);

					first_attachment = new THREE.Vector3();
					first_attachment.addVectors(structures.getObjectByName(s1).position, n1);				
					

					second_attachment = new THREE.Vector3();
					second_attachment.addVectors(structures.getObjectByName(s2).position, n2);

					var lineGeometry = new THREE.Geometry();
					lineGeometry.vertices.push(
						first_attachment,
						second_attachment
					);

					var line = new THREE.Line(lineGeometry, material);
					line.name = [s1,s2,n1,n2];

					forces.add(line);

				}
			}
		}
		callback(forces);
	}
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

function countFrames(callback){

	// find number of frames in frame folder
	$.ajax({
	    url: '../includes/count_frames.php',
	    dataType: 'json',
	    async: false,
	    success: function(obj) {
			callback(obj.result);
	    },
	    error: function(e){
	    	console.log("couldn't count number of files in "+url)
	    }
	});
}

var animate = function() {

	// set the scene size
	var WIDTH = window.innerWidth,
	  	HEIGHT = window.innerHeight;

	// set some camera attributes
	var VIEW_ANGLE = 45,
	  	ASPECT = WIDTH / HEIGHT,
	  	NEAR = 0.1,
	  	FAR = 10000;

	// create a WebGL renderer, camera, and a scene
	var canvas = document.getElementById("protein_viewer");
	renderer = new THREE.WebGLRenderer({ canvas: canvas });

	var camera = new THREE.PerspectiveCamera( VIEW_ANGLE, WIDTH / HEIGHT, NEAR, FAR );
	var scene = new Physijs.Scene();
	var controls = new THREE.OrbitControls(camera, renderer.domElement);

	// add the camera to the scene
	scene.add(camera);
	camera.position.z = 50;

	// start the renderer
	renderer.setSize(WIDTH, HEIGHT);
	// document.body.append( renderer.domElement );

	// create a point light
	var pointLight =
	new THREE.PointLight(0xFFFFFF);

	// set its position
	pointLight.position.x = 10;
	pointLight.position.y = 50;
	pointLight.position.z = 130;

	// add light to the scene
	scene.add(pointLight);

	// read scene data
	var scene_data;
	readSceneData(function (parsed_scene){
		scene_data = parsed_scene;
	}, 'expanded_scene');

	// create structures 
	var structures;
	var linkers;
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
	});

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

			}, frame_index, structures);

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
		scene.simulate();
		controls.update()
	};

	render();
};

var preview = function(scene_input) {

	//clear the previous scene
	if (scene){
		for (var obj; i < scene.length;i++){
			scene.remove( obj );
			renderer.deallocateObject( obj );
		}
	}

	// set the scene size
	var WIDTH = window.innerWidth,
	  	HEIGHT = window.innerHeight;

	// set some camera attributes
	var VIEW_ANGLE = 45,
	  	ASPECT = WIDTH / HEIGHT,
	  	NEAR = 0.1,
	  	FAR = 10000;

	// create a WebGL renderer, camera, and a scene
	var canvas = document.getElementById("protein_viewer");
	renderer = new THREE.WebGLRenderer({ canvas: canvas });

	var camera = new THREE.PerspectiveCamera( VIEW_ANGLE, WIDTH / HEIGHT, NEAR, FAR );
	var scene = new Physijs.Scene();
	var controls = new THREE.OrbitControls(camera, renderer.domElement);

	// add the camera to the scene
	scene.add(camera);
	camera.position.z = 50;

	// start the renderer
	renderer.setSize(WIDTH, HEIGHT);
	// document.body.append( renderer.domElement );

	// create a point light
	var pointLight =
	new THREE.PointLight(0xFFFFFF);

	// set its position
	pointLight.position.x = 10;
	pointLight.position.y = 50;
	pointLight.position.z = 130;

	// add light to the scene
	scene.add(pointLight);

	// create structures 
	var structures;
	var linkers;
	createStructures(function (allStructures){
		structures = allStructures;
	}, scene_input);

	// create force lines
	var forces;
	createForces(function (force_lines){
		forces = force_lines;
	}, scene_input, structures);

	// add the structures and forces
	scene.add(structures);
	scene.add(forces);

	function render() {

		requestAnimationFrame(render);
		renderer.render(scene, camera);
		scene.simulate();
		controls.update()
	};

	render();
};

window.onload = initScene;

$(function() {

	// animate simulation
	document.getElementById("submit_button").addEventListener("click", function(){

		// // try to simulate
		// $.ajax({
		//     url: "http://localhost/cgi-bin/Mechanics/bin/online_simulate2.sh",
		//     type: "post",
		//     async: false,
		//     dataType: "text",
		//     data: "derp",
		//     success: function(response){
		//         console.log(response);

		//     },
		//     fail: function(){
		//     	console.log('error during bashing');
		//     }
		// });

		animate();
		$('#canvas').load(document.URL +  ' #canvas');

	}, true)

	// preview simulation
	document.getElementById("preview_button").addEventListener("click", function(){

		var scene_input = document.getElementById("scene_data").value;

		var expanded_scene;

		// expand scene
		$.ajax({
		    url: "http://localhost/cgi-bin/Mechanics/bin/ajax_expand_scene.py",
		    type: "post",
		    async: false,
		    contentType: "application/json",
		    dataType: "json",
		    data: scene_input,
		    success: function(response){
		        expanded_scene = response;

		    },
		    fail: function(){
		    	console.log('error during expanding scene');
		    }
		});

		preview(expanded_scene);
		$('#canvas').load(document.URL +  ' #canvas');
	}, true)

});
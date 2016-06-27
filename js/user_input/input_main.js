$(function() {

	structure_counter = 1;
	linker_box_counter = 1;
	pdb_box_counter = 1;
	pdb_counter = 1;
	force_counter = 1;

	// add structure clicked
	$(document).on("click", "#add-custom-structure", function(){
		addStructure(structure_counter);
	    structure_counter++;
	});
	// add linker 
    $(document).on("click", "#add-linker", function(){
    	addLinkerInputBox(linker_box_counter);
    	linker_box_counter++;
    });
    // add pdb 
    $(document).on("click", "#add-pdb-structure", function(){
    	addPdbStructure(pdb_box_counter);
    	pdb_box_counter++;
    }); 
    // add absolute position constraint
    $(document).on("click", "#add-absolute-position-constraint", function(){
    	addAbsolutePositionConstraint(force_counter);
    	force_counter++;
    }); 
    // add relative position constraint
    $(document).on("click", "#add-relative-position-constraint", function(){
    	addRelativePositionConstraint(force_counter);
    	force_counter++;
    }); 
    // add volume exclusion constraint
    $(document).on("click", "#add-volume-exclusion-constraint", function(){
    	addVolumeExclusionConstraint();
    })
});



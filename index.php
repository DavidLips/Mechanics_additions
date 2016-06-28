<html>
  <head>

    <?php if (isset($title)): ?>
        <title>Shapesifter: <?= htmlspecialchars($title) ?></title>
    <?php else: ?>
        <title>ShapeShifter</title>
    <?php endif ?>

    <link rel="stylesheet" type="text/css" href="css/stylesheet.css" media="screen"/>
    <link rel="stylesheet" type="text/css" href="css/buttons.css" media="screen"/> 
    <link rel="stylesheet" type="text/css" href="css/jquery-ui.structure.css" media="screen" />
    <link rel="stylesheet" type="text/css" href="css/jquery-ui.theme.css" media="screen" />
    <link rel="stylesheet" type="text/css" href="css/jquery-ui.css" media="screen" />

    <!-- Bootstrap -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">
    

    <script type="text/javascript" src="js/lib/three.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js"></script>
    <script type="text/javascript" src="js/lib/jquery-ui.js"></script>
    <!-- <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js" integrity="sha384-0mSbJDEHialfmuBBQP6A4Qrprq5OVfW37PRR3j5ELqxss1yVqOtnepnHVP9aJ7xS" crossorigin="anonymous"></script> -->

    <script type="text/javascript" src="Shapesifter/expand_scene/node_modules/requirejs/require.js"></script>

    <script type="text/javascript" src="js/lib/trackball_controls.js"></script>
    <script type="text/javascript" src="js/lib/OrbitControls.js"></script>
    
    
    <script>
    $(function() {
      $( "#accordion" ).accordion();
    });
    </script>
    <!-- <script type="text/javascript" src="js/threejs_viewer.js"></script>-->    
    <script type="text/javascript" src="js/threejs_previewer.js"></script>
    <script type="text/javascript" src="js/threejs_animator.js"></script>


    <script type="text/javascript" src="Shapesifter/expand_scene/expand_scene_js.js"></script>

    <script type="text/javascript" src="js/user_input/input_main.js"></script>
    <script type="text/javascript" src="js/user_input/absolute_position_constraint.js"></script>
    <script type="text/javascript" src="js/user_input/relative_position_constraints.js"></script>
    <script type="text/javascript" src="js/user_input/volume_exclusion_constraint.js"></script>
    <script type="text/javascript" src="js/user_input/flexible_linkers.js"></script>
    <script type="text/javascript" src="js/user_input/custom_structures.js"></script>
    <script type="text/javascript" src="js/user_input/pdb_structures.js"></script>
    <script type="text/javascript" src="js/user_input/helpers.js"></script>

  </head>
  <body>

    <nav class="navbar navbar-default">
  <div class="container-fluid">
    <!-- Brand and toggle get grouped for better mobile display -->
    <div class="navbar-header">
      <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
        <span class="sr-only">Toggle navigation</span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </button>
      <a class="navbar-brand" href="#">Shapesifter</a>
    </div>

    <!-- Collect the nav links, forms, and other content for toggling -->
    <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
      <ul class="nav navbar-nav">
        <li class="active"><a href="#">Home <span class="sr-only">(current)</span></a></li>
        <li><a href="https://github.com/avimosher/shapesifter/wiki" target="_blank">Documentation</a></li>
        <!-- <li class="dropdown">
          <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Dropdown <span class="caret"></span></a>
          <ul class="dropdown-menu">
            <li><a href="#">Action</a></li>
            <li><a href="#">Another action</a></li>
            <li><a href="#">Something else here</a></li>
            <li role="separator" class="divider"></li>
            <li><a href="#">Separated link</a></li>
            <li role="separator" class="divider"></li>
            <li><a href="#">One more separated link</a></li>
          </ul>
        </li> -->
      </ul>
      <ul class="nav navbar-nav navbar-right">
       
      </ul>
    </div><!-- /.navbar-collapse -->
  </div><!-- /.container-fluid -->
</nav>    


    <div id="header_text" style="text-align:center;">

        <h1>
            <span class="dark">Shape</span><span class="light">sifter</span>
        </h1>
        <p> Shapesifter is a simulation and visualization tool for making time-saving predictions about  <br> optimal molecular configurations. Documentation and examples available <a href="https://github.com/avimosher/shapesifter/wiki">here</a>.</p>
        <hr style="border-width:3px">



    <div id="viewer_and_buttons" style="text-align:center;">

        <div id="structure_buttons" >
            <input type="button" id="add-custom-structure"  class="button button-block button-rounded button-large" value="Custom structure" style="white-space:normal" style="font-size:18; padding:9px 10px 10px 10px;"/>
            <input type="button" id="add-pdb-structure"  class="button button-block button-rounded button-large" value="PDB structure" style="font-size:18; padding:9px 10px 10px 10px;"/>
            <input type="button" id="add-linker"  class="button button-block button-rounded  button-large" value="Linker" style="font-size:18; padding:9px 10px 10px 10px;"/>
            <input type="button" id="add-absolute-position-constraint"  class="button button-block button-rounded button-large" value="Absolute position constraint" style="font-size:18; padding:9px 10px 10px 10px;"/>
            <input type="button" id="add-relative-position-constraint"  class="button button-block button-rounded button-large" value="Relative position constraint" style="font-size:18; padding:9px 10px 10px 10px;"/>
            <input type="button" id="add-volume-exclusion-constraint"  class="button button-block button-rounded button-large" value="Volume exclusion constraint" style="font-size:18; padding:9px 10px 10px 10px;">
            <input type="button" id="simulate_button" class="button button-block button-rounded button-caution button-large" value="Simulate" style="font-size:18; padding:9px 10px 10px 10px;">

        </div>

        <canvas id="protein_viewer" style="position:relative;margin:auto;" ></canvas>
    </div>


    <div id="input_container" style="position:relative;text-align:center">

        <div id="element_field" style="background-color:#f5f5f5;width:51%;display:inline-block;position:relative;margin:auto;border:1px solid;border-radius:5px;">
        
            <div class="structure_header"><h4 class="struct_header_text"><b>Structures</b></h4></div>
            <div id="structure_accordion"></div> 

            <div class="structure_header"><h4 class="struct_header_text"><b>Linkers</b></h4></div>
            <div id="linker_accordion"></div>

            <div class="structure_header"><h4 class="struct_header_text"><b>Forces</b></h4></div>
            <div id="forces_accordion"></div>

        </div>

        <div style="overflow-y:auto;overflow-x:hidden;width:25%;height:550px;display:inline-block;position:relative;margin:auto;">
        <form name="scene_form" id="scene_form" method="post" action="" >
        <textarea rows="30" cols="60" id="scene_data" name="scene_data">
    {
        "output_directory": "frames/minimal_analysis",
        "dt": 0.1,
        "last_time": 10,
        "root": [
            {"type": "DATA",
             "eta": 3.5},
            {"type": "RIGID_STRUCTURE",
             "position": [1, 1, 1],
             "radius": 1,
             "name": "object"
            },
            {"type": "BROWNIAN_FORCE",
             "temperature": 300},
            {"type": "TRUST_REGION",
             "name": "evolution"},
            {"type": "ANALYTE",
             "prerequisites": ["evolution"],
             "predicate": {
                 "type": "distance",
                 "first": {
                     "type": "rigid_structure_position",
                     "name": "object",
                     "offset": [0,0,0]},
                 "second": {
                     "type": "vector",
                     "vector": [1,1,1]}},
             "aggregator": {"type": "record",
                           "min": 0,
                           "max": 2,
                           "bins": 10}
            }
        ]
    }


        </textarea><br/>
      </form>
  </div>

</div>

</body>
</html>

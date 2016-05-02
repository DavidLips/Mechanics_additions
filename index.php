<html>
  <head>

    <?php if (isset($title)): ?>
        <title>Shapesifter: <?= htmlspecialchars($title) ?></title>
    <?php else: ?>
        <title>ShapeShifter</title>
    <?php endif ?>

    <link rel="stylesheet" type="text/css" href="stylesheet.css" media="screen" />
    <link rel="stylesheet" type="text/css" href="css/jquery-ui.css" media="screen" />

    <script type="text/javascript" src="js/three.min.js"></script>
    <script type="text/javascript" src="js/physi.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js"></script>
    <script type="text/javascript" src="js/jquery-ui.js"></script>
    <script src="http://requirejs.org/docs/release/2.1.11/minified/require.js"></script>
    <script type="text/javascript" src="js/trackball_controls.js"></script>
    <script type="text/javascript" src="js/OrbitControls.js"></script>
    <script type="text/javascript">
        Physijs.scripts.worker = 'js/physijs_worker.js';
        Physijs.scripts.ammo = 'ammo.js';
    </script>
    <script>
    $(function() {
      $( "#accordion" ).accordion();
    });
    </script>
    <!-- <script type="text/javascript" src="js/threejs_viewer.js"></script>-->    
    <script type="text/javascript" src="js/threejs_previewer.js"></script>
    <script type="text/javascript" src="js/user_input.js"></script>


  </head>
  <body>
    

<h1>Welcome to Project ShapeSifter</h1>
    <p> We're building a synthetic biology design tool for the simulation of multi-domain proteins, 
        their geometrical configuration, and other molecular magic. Feel free to play around with 
        the input form below. Stay tuned for Beta 1.0! </p>

<div id="input_container" style="float:left;width:400px">
  <form name="scene_form" id="scene_form" method="post" action="">
    <textarea rows="30" cols="60" id="scene_data" name="scene_data">
{
 "output_directory": "cgi-test",
 "dt": 0.1,
 "last_time": 10,
 "root": [
  {
   "type": "DATA",
   "eta": 3.5
  },
  {
   "type": "BROWNIAN_FORCE",
   "temperature": 300
  },
  {
   "type": "TRUST_REGION",
   "name": "evolution"
  }
 ]
}
    </textarea><br/>
    <input type="button" id="submit_button" name="submit_button" value="Submit">
  </form>

    
    <div id="buttons">
      <input type="button" id="add-custom-structure"  class="add-button" value="add custom structure" />
      <input type="button" id="add-pdb-structure"  class="add-button" value="add pdb structure" />
      <input type="button" id="add-linker"  class="add-button" value="add a linker" />
    </div>

    <div id="structure_accordion"></div>
    <div id="pdb_accordion"></div>
    <div id="linker_accordion"></div>
</div>

    <div id="view_container" style="height:100%;overflow:hidden;position:relative">
        <canvas id="protein_viewer" style="width:30%;height:80%;position:absolute" ></canvas>
    </div>

    <br/>
        <hr style="background-color: rgb(150,150,150); color: rgb(150,150,150); width: 100%; height: 4px;">
    <br/>

</body>
</html>

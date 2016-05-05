<html>
  <head>
    <?php if (isset($title)): ?>
        <title>Shapesifter: <?= htmlspecialchars($title) ?></title>
    <?php else: ?>
        <title>ShapeShifter</title>
    <?php endif ?>
    <script type="text/javascript" src="js/three.min.js"></script>
    <script type="text/javascript" src="js/physi.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js"></script>
    <script src="http://requirejs.org/docs/release/2.1.11/minified/require.js"></script>
    <script type="text/javascript" src="js/trackball_controls.js"></script>
    <script type="text/javascript" src="js/OrbitControls.js"></script>
    <script type="text/javascript">
        Physijs.scripts.worker = 'js/physijs_worker.js';
        Physijs.scripts.ammo = 'ammo.js';
    </script>
    <script type="text/javascript" src="js/threejs_viewer.js"></script>


  </head>
  <body>
    
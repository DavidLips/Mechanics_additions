

<h1>Welcome to Project ShapeSifter</h1>
    <p> We're building a synthetic biology design tool for the simulation of multi-domain proteins, 
        their geometrical configuration, and other molecular magic. Feel free to play around with 
        the input form below. Stay tuned for Beta 0.001! </p>
    <form name="scene_form" id="scene_form" method="post" action="">
        <textarea rows="30" cols="100" id="scene_data" name="scene_data">
{
    "output_directory": "cgi-test",
    "dt": 0.1,
    "last_time": 10,
    "root": [
        {"type": "DATA",
         "eta": 3.5},
        {"type": "RIGID_STRUCTURE",
         "position": [1, 1, 1],
         "radius": 1,
         "collision_extent": 0.6,
         "name": "object"
        },
        {"type": "BROWNIAN_FORCE",
         "temperature": 300},
        {"type": "TRUST_REGION",
         "name":"evolution"},
         {"type":"ANALYTE",
          "prerequisites":["evolution"],
          "predicate":{
                "type": "rigid_structure_position",
                "name": "object",
                "offset": [0,0,1]},
           "aggregator": {"type": "average"}
         }
    ]
}
        </textarea><br/>
        <input type="submit" name="submit_button" value="Submit">
        <input type="button" id="preview_button" name="preview_button" value="Preview">
    </form>

    <br/>
        <hr style="background-color: rgb(150,150,150); color: rgb(150,150,150); width: 100%; height: 4px;">
    <br/>

    <p>Viewer:</p>

    <div id="view_container" width="100%" height="100%">
        <canvas id="protein_viewer" style="width:100%;height:80%;display: block;" ></canvas>
    </div>


    <?php
    if (isset($_POST)){

        $counter = 0;
        if ($_POST['submit_button'] == "Submit") {
            while(file_exists('scenes/scene_file-'. $counter . ".json")){
                $counter++;
                if(!file_exists('scenes/scene_file-' . $counter . ".json")){
                    $file = tmpfile();
                    break;
                }                
            }
            $file = fopen('scenes/scene_file-' . $counter . ".json","a+");
            while(!feof($file)){
                $old = $old . fgets($file);
            }
            $text = $_POST["scene_data"];

            file_put_contents('scenes/scene_file-' . $counter . ".json", $old . $text);
            fclose($file);

            redirect('cgi-bin/Mechanics/bin/online_simulate.sh?scenefile=scene_file-'.$counter.".json");
        }
        if ($_POST['preview_button'] == "Preview") {
            
            $text = $_POST["scene_data"];
            

        }

    }
    ?>
var canvas = document.getElementById("renderCanvas"); // Get the canvas element
var engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

const size = 5,
  count = 5,
  mineCount = 5;

var createScene = function() {
  var scene = new BABYLON.Scene(engine);
  var camera = new BABYLON.ArcRotateCamera(
    "Camera",
    (3 * Math.PI) / 2,
    1.2,
    100,
    BABYLON.Vector3.Zero(),
    scene
  );

  camera.attachControl(canvas, true);

  var light1 = new BABYLON.HemisphericLight(
    "light1",
    new BABYLON.Vector3(1, 1, 0),
    scene
  );
  var light2 = new BABYLON.PointLight(
    "light2",
    new BABYLON.Vector3(0, 1, -1),
    scene
  );

  let materials = new Materials(scene);
  let game = new Game(size, count, materials);

  let offset = new BABYLON.Vector3(
    (-size * count * 1.1) / 2,
    (-size * count * 1.1) / 2,
    (-size * count * 1.1) / 2
  );

  for (let i = 0; i < count; ++i) {
    game.boxes.push([]);
    game.field.push([]);
    game.uncovered.push([]);
    for (let j = 0; j < count; ++j) {
      game.boxes[i].push([]);
      game.field[i].push([]);
      game.uncovered[i].push([]);
      for (let k = 0; k < count; ++k) {
        game.field[i][j].push(0);
        game.uncovered[i][j].push(0);
        var box = BABYLON.MeshBuilder.CreateBox(
          `box ${i} ${j} ${k}`,
          { height: size, width: size, depth: size },
          scene
        );

        box.position = new BABYLON.Vector3(
          size * k * 1.1,
          size * j * 1.1,
          size * i * 1.1
        ).add(offset);

        let mat = (i == game.plane ? materials.plane : materials.normal)["?"];
        box.material = mat;
        box.isPickable = i == game.plane;
        game.boxes[i][j].push(box);
      }
    }
  }

  var map = {};
  scene.actionManager = new BABYLON.ActionManager(scene);

  scene.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(
      BABYLON.ActionManager.OnKeyDownTrigger,
      function(evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
      }
    )
  );

  scene.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(
      BABYLON.ActionManager.OnKeyDownTrigger,
      function(evt) {
        game.keys(evt.sourceEvent.key);
      }
    )
  );

  scene.onPointerDown = (evt, pickResult) => {
    game.hit(pickResult);
  };

  return scene;
};

var scene = createScene();

engine.runRenderLoop(function() {
  scene.render();
});

window.addEventListener("resize", function() {
  engine.resize();
});

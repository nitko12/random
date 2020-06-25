let assetPaths = ["tiles", "tree"];

let game;
let canvas = document.getElementById("canvas");
canvas.width = 1280;
canvas.height = 720;

loadImages(assetPaths, (assets) => {
  game = new Game(canvas, assets);

  let updater = function () {
    game.update();
    game.render();
    requestAnimationFrame(updater);
  };
  requestAnimationFrame(updater);
});

document.addEventListener("mousemove", (e) => {
  game.event(e);
});

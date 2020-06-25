class Game {
  constructor(canvas, assets) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.assets = assets;
    this.world = new World();
    this.player = { x: 0, y: 0 };
    this.mouse = { x: -1, y: -1 };
  }

  event(e) {
    let rect = this.canvas.getBoundingClientRect();
    this.mouse = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  update() {
    let x = this.mouse.x;
    let y = this.mouse.y;

    let speed = 2.5;

    let f = (v) => Math.pow(v, 7); // map movement
    if (0 <= x && x < this.canvas.width && 0 <= y && y < this.canvas.height) {
      let j = f(x / (this.canvas.width / 2) - 1);
      let i = f(y / (this.canvas.height / 2) - 1);
      [j, i] = rotate(j, i, -Math.PI / 4);
      this.player.x += j * speed;
      this.player.y += i * speed;
    }
  }

  render() {
    let width = this.canvas.width;
    let height = this.canvas.height;

    this.context.save();
    this.context.clearRect(0, 0, width, height);
    let img = this.assets["tiles"];
    let tree = this.assets["tree"];

    let tileWidth = 60;
    let tileHeight = 30;

    this.context.translate(width / 2, -height / 2);

    let drawImageTile = (x, y, index) => {
      this.context.save();

      this.context.drawImage(
        img,
        index * tileWidth,
        0,
        tileWidth,
        img.height,
        -tileWidth / 2 + ((x - y) * tileWidth) / 2,
        ((x + y) * tileHeight) / 2 + (index < 4 ? 5 : 0),
        tileWidth,
        img.height
      );

      this.context.restore();
    };

    let drawTreeTile = (x, y) => {
      this.context.save();

      this.context.drawImage(
        tree,
        0,
        0,
        tree.width,
        tree.height,
        -tileWidth / 2 + ((x - y) * tileWidth) / 2,
        ((x + y) * tileHeight) / 2,
        tree.width,
        tree.height
      );

      this.context.restore();
    };

    for (let i = 0; i < 50; ++i) {
      for (let j = 0; j < 50; ++j) {
        let x = j + Math.floor(this.player.x);
        let y = i + Math.floor(this.player.y);

        let offsetX = this.player.x - Math.floor(this.player.x);
        let offsetY = this.player.y - Math.floor(this.player.y);

        drawImageTile(j - offsetX, i - offsetY, this.world.getValue(x, y));
      }
    }

    let chunk = this.world.getTrees(
      Math.floor(this.player.x / 256),
      Math.floor(this.player.y / 256)
    );

    for (let i of chunk) {
      drawTreeTile(i[0] - this.player.x, i[1] - this.player.y);
    }

    this.context.restore();
  }
}

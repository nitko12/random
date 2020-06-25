const scale = 100,
  chunkSize = 256;
class World {
  constructor() {
    noise.seed(Math.random());
    this.loadedTrees = new Map();
  }

  getValue(x, y) {
    return Math.floor(Math.abs(noise.simplex2(x / scale, y / scale)) * 10);
  }

  getTrees(x, y) {
    let chunkX = Math.floor(x / chunkSize);
    let chunkY = Math.floor(y / chunkSize);

    for (let dx = -1; dx <= 1; ++dx) {
      for (let dy = -1; dy <= 1; ++dy) {
        let xx = chunkX + dx;
        let yy = chunkY + dy;
        if (!this.loadedTrees.has(xx.toString() + ", " + yy.toString()))
          this.loadedTrees.set(
            xx.toString() + ", " + yy.toString(),
            this.makeChunk(xx, yy)
          );
      }
    }

    for (let k of this.loadedTrees.keys()) {
      let x = parseInt(k.split(",")[0]),
        y = parseInt(k.split(",")[1]);
      if (Math.hypot(x - chunkX, y - chunkY) > 1.5) {
        this.loadedTrees.delete(k);
      }
    }

    return this.loadedTrees.get(chunkX.toString() + ", " + chunkY.toString());
  }

  makeChunk(chunkX, chunkY) {
    let rng = new Math.seedrandom(chunkX.toString() + ", " + chunkY.toString());

    let r = 5; // min dist

    let k = 30;
    let grid = [];
    let w = r / Math.sqrt(2);

    let active = [];

    let n = Math.floor(chunkSize / w);

    for (let i = 0; i < n * n; ++i) {
      grid.push(-1);
    }

    let p0 = [rng() * chunkSize, rng() * chunkSize];

    let j = Math.floor(p0[0] / w);
    let i = Math.floor(p0[1] / w);

    grid[j + i * n] = p0;
    active.push(p0);

    while (active.length > 0) {
      let index = Math.floor(rng() * active.length);
      let pos = active[index];

      let found = false;

      for (let i = 0; i < k; ++i) {
        let phi = rng() * 2 * Math.PI;
        let mag = r + r * rng();

        let x = Math.cos(phi) * mag + pos[0];
        let y = Math.sin(phi) * mag + pos[1];

        if (0 > x || x >= chunkSize || 0 > y || y >= chunkSize) continue;

        let gx = Math.floor(x / w);
        let gy = Math.floor(y / w);

        if (grid[gx + gy * n] != -1) continue;

        let f = false;
        for (let dx = -1; dx <= 1; ++dx) {
          for (let dy = -1; dy <= 1; ++dy) {
            let xx = gx + dx;
            let yy = gy + dy;

            if (
              0 <= xx &&
              xx < n &&
              0 <= yy &&
              yy < n &&
              grid[xx + yy * n] != -1
            ) {
              let cell = grid[xx + yy * n];

              let d = Math.hypot(x - cell[0], y - cell[1]);

              if (d < r) {
                f = true;
              }
            }
          }
        }

        if (!f) {
          grid[gx + gy * n] = [x, y];
          active.push([x, y]);
          found = true;
        }
      }
      if (!found) active.splice(index, 1);
    }

    let res = [];

    for (let i = 0; i < n * n; ++i) {
      if (grid[i] != -1) {
        res.push([
          grid[i][0] + chunkX * chunkSize,
          grid[i][1] + chunkY * chunkSize,
        ]);
      }
    }

    return res;
  }
}

class Game {
  constructor(size, count, materials) {
    this.size = size;
    this.count = count;
    this.boxes = [];
    this.field = [];
    this.uncovered = [];
    this.plane = 2;
    this.materials = materials;
    this.firstMove = true;
    this.mines = new GeneralSet();
  }

  keys(key) {
    if (key == "w") this.plane = Math.max(0, this.plane - 1);
    if (key == "s") this.plane = Math.min(count - 1, this.plane + 1);
    for (let i = 0; i < count; ++i)
      for (let j = 0; j < count; ++j)
        for (let k = 0; k < count; ++k)
          this.boxes[i][j][k].isPickable = i == this.plane;
    this.resetTextures();
  }
  hit(pickResult) {
    if (pickResult.hit) {
      let i = parseInt(pickResult.pickedMesh.name.split(" ")[1]),
        j = parseInt(pickResult.pickedMesh.name.split(" ")[2]),
        k = parseInt(pickResult.pickedMesh.name.split(" ")[3]);
      this.uncovered[i][j][k] = 1;
      if (this.firstMove) {
        this.makeField(i, j, k);
        this.firstMove = false;
      }
      this.move(i, j, k);
    }
    this.resetTextures();
  }

  move(i, j, k) {
    if (this.mines.has([i, j, k])) {
      alert("You lose!");
      location.reload();
    }
    this.flood(i, j, k);
  }

  makeField(x, y, z) {
    let possible = [];
    for (let i = 0; i < count; ++i) {
      for (let j = 0; j < count; ++j) {
        for (let k = 0; k < count; ++k) {
          if (i == x && j == y && k == z) continue;
          possible.push([i, j, k]);
        }
      }
    }

    possible.sort(() => Math.random() - 0.5);
    for (let i = 0; i < mineCount; ++i) this.mines.add(possible[i]);

    for (let i = 0; i < count; ++i) {
      for (let j = 0; j < count; ++j) {
        for (let k = 0; k < count; ++k) {
          const dx = [-1, -1, -1, -1, -1, -1, -1, -1, -1]
            .concat([0, 0, 0, 0, 0, 0, 0, 0])
            .concat([1, 1, 1, 1, 1, 1, 1, 1, 1]);

          const dy = [-1, -1, -1, 0, 0, 0, 1, 1, 1]
            .concat([-1, -1, -1, 0, 0, 1, 1, 1])
            .concat([-1, -1, -1, 0, 0, 0, 1, 1, 1]);

          const dz = [-1, 0, 1, -1, 0, 1, -1, 0, 1]
            .concat([-1, 0, 1, -1, 1, -1, 0, 1])
            .concat([-1, 0, 1, -1, 0, 1, -1, 0, 1]);

          let cnt = 0;
          if (this.mines.has([i, j, k])) {
            this.field[i][j][k] = -1;
            continue;
          }

          for (let p = 0; p < 26; ++p) {
            let xx = i + dx[p],
              yy = j + dy[p],
              zz = k + dz[p];
            if (
              0 <= xx &&
              xx < count &&
              0 <= yy &&
              yy < count &&
              0 <= zz &&
              zz < count &&
              this.mines.has([xx, yy, zz])
            )
              ++cnt;
          }
          this.field[i][j][k] = cnt;
        }
      }
    }
  }

  resetTextures() {
    for (let i = 0; i < count; ++i) {
      for (let j = 0; j < count; ++j) {
        for (let k = 0; k < count; ++k) {
          let mats =
            i == this.plane ? this.materials.plane : this.materials.normal;
          let mat;
          if (this.uncovered[i][j][k] == 1) mat = this.materials.empty["?"];
          else if (this.field[i][j][k] == 0) mat = mats["?"];
          else if (this.field[i][j][k] == -1) mat = mats["?"];
          else mat = mats[this.field[i][j][k].toString()];
          this.boxes[i][j][k].material = mat;
        }
      }
    }
  }
  flood(i, j, k) {
    if (this.field[i][j][k] != 0 || this.uncovered[i][j][k] == 1) return;
    this.uncovered[i][j][k] = 1;
    const dx = [-1, -1, -1, -1, -1, -1, -1, -1, -1]
      .concat([0, 0, 0, 0, 0, 0, 0, 0])
      .concat([1, 1, 1, 1, 1, 1, 1, 1, 1]);

    const dy = [-1, -1, -1, 0, 0, 0, 1, 1, 1]
      .concat([-1, -1, -1, 0, 0, 1, 1, 1])
      .concat([-1, -1, -1, 0, 0, 0, 1, 1, 1]);

    const dz = [-1, 0, 1, -1, 0, 1, -1, 0, 1]
      .concat([-1, 0, 1, -1, 1, -1, 0, 1])
      .concat([-1, 0, 1, -1, 0, 1, -1, 0, 1]);

    for (let p = 0; p < 26; ++p) {
      let xx = i + dx[p],
        yy = j + dy[p],
        zz = k + dz[p];
      if (
        0 <= xx &&
        xx < count &&
        0 <= yy &&
        yy < count &&
        0 <= zz &&
        zz < count
      )
        this.flood(xx, yy, zz);
    }
  }
}

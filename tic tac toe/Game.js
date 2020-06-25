class Game {
  constructor(w, h, offsetX, offsetY) {
    this.arr = [];
    this.w = w;
    this.h = h;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.winner = 0;
    for (let i = 0; i < 3; ++i) {
      this.arr.push([]);
      for (let j = 0; j < 3; ++j) {
        this.arr[i].push(0);
      }
    }
  }

  isOver() {
    for (let i = 0; i < 3; ++i) {
      if (!this.arr[i][0] || !this.arr[i][1] || !this.arr[i][2]) continue;
      if (
        this.arr[i][0] == this.arr[i][1] &&
        this.arr[i][1] == this.arr[i][2]
      ) {
        return this.arr[i][0];
      }
    }
    for (let i = 0; i < 3; ++i) {
      if (!this.arr[0][i] || !this.arr[1][i] || !this.arr[2][i]) continue;
      if (
        this.arr[0][i] == this.arr[1][i] &&
        this.arr[1][i] == this.arr[2][i]
      ) {
        return this.arr[0][i];
      }
    }

    if (this.arr[0][2] && this.arr[1][1] && this.arr[2][0]) {
      let win = 1;
      for (let j = 1; j < 3; ++j) {
        if (this.arr[0][2] != this.arr[j][2 - j]) {
          win = 0;
        }
      }
      if (win) return this.arr[0][2];
    }

    if (this.arr[0][0] && this.arr[1][1] && this.arr[2][2]) {
      win = 1;
      for (let j = 1; j < 3; ++j) {
        if (this.arr[0][0] != this.arr[j][j]) {
          win = 0;
        }
      }
      if (win) return this.arr[0][0];
    }
    return 0;
  }

  draw() {
    line(
      this.offsetX + this.w / 3,
      this.offsetY,
      this.offsetX + this.w / 3,
      this.offsetY + this.h
    );
    line(
      this.offsetX + (this.w / 3) * 2,
      this.offsetY,
      this.offsetX + (this.w / 3) * 2,
      this.offsetY + this.h
    );
    line(
      this.offsetX,
      this.offsetY + this.h / 3,
      this.offsetX + this.w,
      this.offsetY + this.h / 3
    );
    line(
      this.offsetX,
      this.offsetY + (this.h / 3) * 2,
      this.offsetX + this.w,
      this.offsetY + (this.h / 3) * 2
    );
  }

  click(x, y, turn) {
    x /= this.w / 3;
    y /= this.h / 3;
    x = Math.floor(x);
    y = Math.floor(y);

    if (!(0 <= x && x < 3 && 0 <= y && y < 3)) return 0;
    if (this.arr[y][x]) return 0;

    if (turn) {
      line(
        (this.w / 3) * x + this.offsetX + this.w * 0.05,
        (this.h / 3) * y + this.offsetY + this.h * 0.05,
        (this.w / 3) * x + this.offsetX + this.w / 3 - this.w * 0.05,
        (this.h / 3) * y + this.offsetY + this.w / 3 - this.h * 0.05
      );
      line(
        (this.w / 3) * x + this.offsetX + this.w * 0.05,
        (this.h / 3) * y + this.offsetY + this.w / 3 - this.w * 0.05,
        (this.w / 3) * x + this.offsetX + this.w / 3 - this.w * 0.05,
        (this.h / 3) * y + this.offsetY + this.w * 0.05
      );
    } else {
      circle(
        (this.w / 3) * x + this.offsetX + this.w / 6,
        (this.h / 3) * y + this.offsetY + this.h / 6,
        (this.h / 3) * 0.9
      );
    }
    this.arr[y][x] = 1 + turn;

    let t = this.isOver();

    if (t) this.winner = t;

    return [x, y];
  }
}

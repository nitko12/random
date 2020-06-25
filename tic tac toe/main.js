let turn = 0,
  games = [],
  possible = new Set();

function isOver() {
  for (let i = 0; i < 3; ++i) {
    if (!games[i][0].winner || !games[i][1].winner || !games[i][2].winner)
      continue;
    if (
      games[i][0].winner == games[i][1].winner &&
      games[i][1].winner == games[i][2].winner
    ) {
      return games[i][0].winner;
    }
  }
  for (let i = 0; i < 3; ++i) {
    if (!games[0][i].winner || !games[1][i].winner || !games[2][i].winner)
      continue;
    if (
      games[0][i].winner == games[1][i].winner &&
      games[1][i].winner == games[2][i].winner
    ) {
      return games[0][i].winner;
    }
  }

  if (games[0][2].winner && games[1][1].winner && games[2][0].winner) {
    let win = 1;
    for (let j = 1; j < 3; ++j) {
      if (games[0][2].winner != games[j][2 - j].winner) {
        win = 0;
      }
    }
    if (win) return games[0][2].winner;
  }

  if (games[0][0].winner && games[1][1].winner && games[2][2].winner) {
    win = 1;
    for (let j = 1; j < 3; ++j) {
      if (games[0][0].winner != games[j][j].winner) {
        win = 0;
      }
    }
    if (win) return games[0][0].winner;
  }
  return 0;
}

function setup() {
  createCanvas(400, 400);
  for (let i = 0; i < 3; ++i) {
    games.push([]);
    for (let j = 0; j < 3; ++j) {
      games[i].push(
        new Game(
          (width * 0.9) / 3,
          (height * 0.9) / 3,
          width * 0.015 + (j * width) / 3,
          height * 0.015 + (i * height) / 3
        )
      );
      possible.add(j + i * 3);
    }
  }
}

function draw() {
  strokeWeight(1);
  for (let i = 0; i < 3; ++i) {
    for (let j = 0; j < 3; ++j) {
      if (possible.has(j + i * 3)) {
        stroke("red");
      } else {
        stroke("white");
      }
      line(
        (j * width) / 3,
        (i * height) / 3,
        (j * width) / 3,
        ((i + 1) * height) / 3
      );
      line(
        (j * width) / 3,
        (i * height) / 3,
        ((j + 1) * width) / 3,
        (i * height) / 3
      );
      line(
        ((j + 1) * width) / 3,
        (i * height) / 3,
        ((j + 1) * width) / 3,
        ((i + 1) * height) / 3
      );
      line(
        (j * width) / 3,
        ((i + 1) * height) / 3,
        ((j + 1) * width) / 3,
        ((i + 1) * height) / 3
      );
      strokeWeight(1);
      stroke("black");
      games[i][j].draw();
    }
  }
}

function mouseClicked() {
  if (0 <= mouseX && mouseX < width && 0 <= mouseX && mouseX < height) {
    let x = Math.floor(mouseX / (width / 3)),
      y = Math.floor(mouseY / (height / 3));

    if (!possible.has(x + y * 3)) return;

    let valid = games[y][x].click(
      mouseX % (width / 3),
      mouseY % (height / 3),
      turn
    );

    if (valid == 0) turn ^= 0;
    else turn ^= 1;

    let t = isOver();

    if (t != 0) {
      alert("player " + (t + 1).toString() + " has won");
      return;
    }

    possible.clear();

    x = valid[0];
    y = valid[1];

    console.log(x, y, games[y][x].winner);
    if (games[y][x].winner == 0) {
      possible.add(x + y * 3);
    } else {
      for (let i = 0; i < 3; ++i) {
        for (let j = 0; j < 3; ++j) {
          if (games[i][j].winner == 0) {
            possible.add(j + i * 3);
          }
        }
      }
    }
  }
}

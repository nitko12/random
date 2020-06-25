var msPerWord = (60000 / document.getElementById("range").value);



var canvas = document.getElementById("c");
var ctx = canvas.getContext("2d");
ctx.font = "100px Garamond";
ctx.textAlign = "center";



function bg() {
  ctx.fillStyle = "grey";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function startRead() {
  var text = document.getElementById("input").value;
  var rj = text.split(" ");
  var ls = new Array(rj.length);
  for (let i = 0; i < rj.length; ++i) { // cumulative sum
    ls[i] = (60000 / document.getElementById("range").value);
    if (i != 0) {
      ls[i] += ls[i - 1];
    }
  }

  var start = new Date();
  var it = setInterval(function () {
    if ((new Date().getTime() - start) >= ls[0]) {

      ctx.fillStyle = "grey";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";
      ctx.fillText(rj[0], canvas.width / 2, canvas.height / 2);

      ls.shift();
      rj.shift();
    }
    if (rj.length == 0) {
      clearInterval(it);
      setTimeout(bg, 3000)
    }
  }, 2);
}
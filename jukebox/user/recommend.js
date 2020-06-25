const recs = io("/recs");

function submit() {
  document.getElementById("status").innerHTML = "Obrađuje se...";
  recs.emit("add", document.getElementById("link").value, data => {
    if (data.accepted)
      document.getElementById("status").innerHTML =
        "Prihvaćeno, čeka odobrenje admina...";
    else
      document.getElementById("status").innerHTML =
        "Odbijeno, provjerite upisani link ili pokušajte ponovo kasnije...";
  });
}

const usertext2 = io("/usertext2");

usertext2.on("connect", function(socket) {
  usertext2.emit("get", data => {
    document.getElementById("poruka-administratora").innerHTML = data;
  });
  usertext2.on("refresh", data => {
    document.getElementById("poruka-administratora").innerHTML = data;
  });
});

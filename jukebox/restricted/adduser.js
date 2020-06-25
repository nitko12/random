let data = {};
draw();

let cnt = 0;

function draw() {
  let i = 0,
    element = "";
  for (let i in data) {
    element += `korisničko ime: <input type='text' name='username' style="width:30%" id="username${i}" value='${
      data[i].username
    }' onkeyup="refresh(${i})"> 
        | lozinka: <input type='text' name='password' style="width:30%" id="password${i}" value='${
      data[i].password
    }' onkeyup="refresh(${i})"> 
        |razred:  <select id='god${i}' oninput="refresh(${i})">
                <option value="1" ${
                  data[i].god == "1" ? "selected" : ""
                }>1.</option>
                <option value="2" ${
                  data[i].god == "2" ? "selected" : ""
                }>2.</option>
                <option value="3" ${
                  data[i].god == "3" ? "selected" : ""
                }>3.</option>
                <option value="4" ${
                  data[i].god == "4" ? "selected" : ""
                }>4.</option>
                <option value="osoblje" ${
                  data[i].god == "osoblje" ? "selected" : ""
                }>osoblje</option>
               </select>
               <select id='raz${i}' value='${data[i].raz}' 
                oninput="refresh(${i})">
                <option value="a" ${
                  data[i].raz == "a" ? "selected" : ""
                }>a</option>
                <option value="b" ${
                  data[i].raz == "b" ? "selected" : ""
                }>b</option>
                <option value="c" ${
                  data[i].raz == "c" ? "selected" : ""
                }>c</option>
                <option value="d" ${
                  data[i].raz == "d" ? "selected" : ""
                }>d</option>
                <option value="e" ${
                  data[i].raz == "e" ? "selected" : ""
                }>e</option>
                <option value="f" ${
                  data[i].raz == "f" ? "selected" : ""
                }>f</option>
                <option value="g" ${
                  data[i].raz == "g" ? "selected" : ""
                }>g</option>
               </select> | <button onclick="deleteId(${i})" style='background-color:red;'>Obriši</button>
               <hr>`;
  }
  document.getElementById("table").innerHTML = element;
}

function fill(id) {
  if (id == 0) {
    for (let key in data) {
      data[key].password = document.getElementById("passwordauto").value;
    }
  } else {
    for (let key in data) {
      data[key].god = document.getElementById("godauto").value;
      data[key].raz = document.getElementById("razauto").value;
    }
  }
  draw();
}

function adduser() {
  data[cnt++] = { username: "", password: "", god: "1", raz: "a" };
  draw();
}

function refresh(id) {
  data[id].username = document.getElementById("username" + id).value;
  data[id].password = document.getElementById("password" + id).value;
  data[id].god = document.getElementById("god" + id).value;
  data[id].raz = document.getElementById("raz" + id).value;
}

function deleteId(id) {
  delete data[id];
  draw();
}

const users = io("/user");

function submit() {
  users.emit("set", data, data => {
    if (data.accepted) alert("Uspjeh!");
    else alert("Nešto je pošlo po zlu, pokušaj kasnije...");

    users.emit("reqrefresh", data => {
      users.emit("reqrefresh", data => {
        allUsers = data;
        refreshAll();
      });
    });
  });
}

let allUsers = {};

// svi korisnici

users.on("connect", socket => {
  users.emit("reqrefresh", data => {
    allUsers = data;
    refreshAll();
  });
});

function clearAll() {
  for (let i of ["1", "2", "3", "4"])
    for (let j of ["a", "b", "c", "d", "e", "f", "g"])
      if (Array.from(document.getElementsByClassName(i + j)).length != 0)
        Array.from(document.getElementsByClassName(i + j))[0].innerHTML =
          "Nema korisnika.";
  if (Array.from(document.getElementsByClassName("osoblje")).length != 0)
    Array.from(document.getElementsByClassName("osoblje"))[0].innerHTML =
      "Nema korisnika.";
}

function refreshAll() {
  let data = allUsers;
  clearAll();
  let str = "Svi korisnici<div style='width:60%'></div>";
  str += `<select id='godDel'>
        <option value=" "> </option>
        <option value="1">1.</option>
        <option value="2">2.</option>
        <option value="3">3.</option>
        <option value="4">4.</option>
        <option value="osoblje">osoblje</option>
       </select>
       <select id='razDel'>
       <option value=" "> </option>
        <option value="a">a</option>
        <option value="b">b</option>
        <option value="c">c</option>
        <option value="d">d</option>
        <option value="e">e</option>
        <option value="f">f</option>
        <option value="g">g</option></select>|
        <button onclick='select()'>Automatski ispuni</button>|
        <button onclick='unselect()'>Poništi odabir</button>
        <button onclick='submitDel()' style='background-color: red;'>Obriši</button><hr>`;
  let t = "";
  document.getElementById("users").innerHTML = str;
  for (let i in data) {
    t =
      "<div style='width:30%'>Korisničko ime: " +
      data[i].username +
      "</div> | ";
    t += `Obriši: <input type="checkbox" id="ch${i}">`;
    t += `<hr>`;

    if (
      Array.from(document.getElementsByClassName(data[i].class)).length != 0 &&
      document.getElementsByClassName(data[i].class)[0].innerHTML ==
        "Nema korisnika."
    ) {
      Array.from(
        document.getElementsByClassName(data[i].class)
      )[0].innerHTML = t;
    } else if (
      Array.from(document.getElementsByClassName(data[i].class)).length != 0
    ) {
      Array.from(
        document.getElementsByClassName(data[i].class)
      )[0].innerHTML += t;
    }
  }
}

function submitDel() {
  let data = allUsers,
    sData = { ids: [] };
  for (let i in data) {
    if (document.getElementById("ch" + i).checked) sData.ids.push(data[i]);
  }
  users.emit("deletefromdb", sData, data => {
    if (data.accepted == true) {
      allUsers = data.data;
      refreshAll();
      alert("Uspjeh!");
    } else alert("Greška pri obradi zahtjeva!");
  });
}

function select() {
  let data = allUsers;
  for (let i in data) {
    if (
      data[i].class ==
      document.getElementById("godDel").value +
        document.getElementById("razDel").value
    )
      document.getElementById("ch" + i).checked = true;
  }
}

function unselect() {
  let data = allUsers;
  for (let i in data) {
    document.getElementById("ch" + i).checked = false;
  }
}

function stepAll() {
  if (confirm("Jesi li siguran?")) {
    users.emit("stepYear", data => {
      if (data.accepted == true) {
        allUsers = data.data;
        refreshAll();
        alert("Uspjeh!");
      } else {
        alert("Neuspijeh, pokušaj malo kasnije");
      }
    });
  }
}

function show(className) {
  let st = ["none", "block"][
    Array.from(document.getElementsByClassName(className))[0].style.display ==
    "none"
      ? 1
      : 0
  ];
  Array.from(document.getElementsByClassName(className)).forEach(el => {
    el.style.display = st;
  });
}

document.getElementById("data").innerHTML = "Učitavanje...";

const queue = io("/queue");

async function refreshQueue(data) {
  data.reverse();
  data.sort((a, b) => parseInt(b.votes) - parseInt(a.votes));
  document.getElementById("data").innerHTML = "";
  Promise.all(
    data.map(u =>
      fetch(
        "https://noembed.com/embed?url=https://www.youtube.com/watch?v=" + u.url
      )
    )
  )
    .then(responses => Promise.all(responses.map(res => res.json())))
    .then(texts => {
      let cnt = 1;
      for (let i = 0; i < texts.length; ++i) {
        let str = `    
          <table class="trend-no1">
          <tr>
          <td class="trend-br1">

          <span style="cursor:default;">
          <a class="new_iframe_thumbnail" id="thumbnail_space" href="https://www.youtube.com/watch?v=${
            data[i].url
          }">
            <span class="thumbnail_naslov">
              <h1 class="naslov_video" id="naslov_videozapisa">${
                texts[i]["title"]
              }</h1>
              <div class="play_button"></div>
            </span>
            <img src="${texts[i]["thumbnail_url"]}" class="thumbnail_slika">
          </a>
        </span>

        </td>
            <td class="trend-broj-1"><p class="trend-broj">#${cnt++}</p></td>
            <td class="naziv-pjesme"><h4 id="naziv-pjesme">Odabralo: ${
              data[i].votes
            }</h4></td>
                    <td class="trend-broj-${
                      data[i].votes
                    }"><p class="lajk"><i class="material-icons glasaj-icon" style="font-size:70px;" title="Daj glas ovoj pjesmi" id="glasaj" onclick="vote('${
          data[i].id
        }')">thumb_up</i><div class="inace_skriveno">${
          data[i].votes
        }</div></p></td>
        </tr>
        </table>`;
        document.getElementById("data").innerHTML += str;
      }
    });
  //str += `<iframe src="https://www.youtube-nocookie.com/embed/${el.url}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  //str += ` Odabralo: ${el.votes} `;
  //str += `<button onclick="vote('${el.id}')">Glasaj</button>`;
  //str += `<hr>`;
}

function vote(id) {
  queue.emit("vote", id, data => {
    if (data.accepted) alert("Uspješno ste dali glas!");
    else alert("Pričekajte malo prije ponovnog glasovanja!");
  });
}

queue.on("connect", function(socket) {
  queue.emit("get", null, data => {
    refreshQueue(data);
  });
  queue.on("refresh", data => {
    refreshQueue(data);
  });
});

const usertext2 = io("/usertext2");

usertext2.on("connect", function(socket) {
  usertext2.emit("get", data => {
    document.getElementById("poruka-administratora").innerHTML = data;
  });
  usertext2.on("refresh", data => {
    document.getElementById("poruka-administratora").innerHTML = data;
  });
});

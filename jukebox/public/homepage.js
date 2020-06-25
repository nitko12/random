const queue = io("/publicqueue");

async function refreshQueue(data) {
  data.reverse();
  data.sort((a, b) => parseInt(b.votes) - parseInt(a.votes));
  const response = await fetch(
    `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${data[0].url}`
  );
  const json = await response.json();
  document.getElementById("naziv-pjesme").innerHTML = json["title"];

  Promise.all(
    data.map(u =>
      fetch(
        "https://noembed.com/embed?url=https://www.youtube.com/watch?v=" + u.url
      )
    )
  )
    .then(responses => Promise.all(responses.map(res => res.json())))
    .then(texts => {
      for (let i = 0; i < 5; ++i) {
        if (!data[i]) break;
        document.getElementById(
          `link_${i + 1}`
        ).href = `https://www.youtube.com/watch?v=${data[i].url}`;

        if (i == 0)
          document.getElementById(
            `naslov_videozapisa_trend_${i + 1}_mob`
          ).innerHTML = texts[i]["title"];
        if (i == 0)
          document.getElementById(`thumbnail_slika_${i + 1}_mob`).src =
            texts[i]["thumbnail_url"];

        document.getElementById(`naslov_videozapisa_trend_${i + 1}`).innerHTML =
          texts[i]["title"];
        document.getElementById(`thumbnail_slika_${i + 1}`).src =
          texts[i]["thumbnail_url"];
      }
    });

  for (let i = 1; i <= 5; ++i) {
    if (data[i - 1])
      document.getElementById(
        `naslov_videozapisa_trend_${i}`
      ).src = `https://www.youtube-nocookie.com/embed/${data[i - 1].url}`;
    if (data[i - 1] && i == 1)
      document.getElementById(
        `naslov_videozapisa_trend_${i}_mob`
      ).src = `https://www.youtube-nocookie.com/embed/${data[i - 1].url}`;
  }
}

queue.on("connect", function(socket) {
  queue.emit("get", null, data => {
    refreshQueue(data);
  });
  queue.on("refresh", data => {
    refreshQueue(data);
  });
});

var url = new URL(window.location.href);
var c = url.searchParams.get("login");
if (c == "0") alert("Prijava neuspjesna!");

document.getElementById("poruka-administratora").innerHTML = "Učitavanje...";

const usertext = io("/usertextpublic");

function refreshUserText(data) {
  document.getElementById("poruka-administratora").innerHTML = data;
}

usertext.on("connect", function(socket) {
  usertext.emit("get", null, data => {
    refreshUserText(data);
  });
  usertext.on("refresh", data => {
    refreshUserText(data);
  });
});

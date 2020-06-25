const fs = require("fs");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const wavplayer = require("node-wav-player");

const consts = require("./consts.js");

function shuffle(a) {
  let j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

module.exports = function(db, onplay) {
  class Player {
    constructor() {
      this.command = null;
      this.yt = null;
      this.queue = { index: -1, data: [] };
    }
    async play(num, arr) {
      if (!arr) {
        db.queue.getAll((err, data) => {
          if (err) return console.log(err);
          num %= data.length;
          shuffle(data);
          data.sort((a, b) => b.votes - a.votes);
          this.queue = { index: num, data: data };
          if (data.length == 0) return;
          let t = data[num].url;
          console.log("Downloading: ", t);
          onplay(data[num].id);
          this.yt = ytdl(`https://www.youtube.com/watch?v=${t}`);
          this.command = ffmpeg(this.yt)
            .output("./temp/temp.wav")
            .noVideo()
            .format("wav")
            .outputOptions("-ar", "44100")
            .on("end", () => {
              this.command = null;
              this.yt = null;
              wavplayer
                .play({
                  path: "./temp/temp.wav",
                  sync: true
                })
                .then(
                  () => {
                    console.log("The wav file played successfully.");
                    fs.unlink("./temp/temp.wav", err => {
                      if (err) console.log(err);
                    });
                    this.play(num + 1, data);
                  },
                  err => {
                    console.log(err);
                  }
                )
                .catch(error => {
                  console.error(error);
                });
            })
            .run();
        });
        return;
      } else {
        let data = arr;
        num %= data.length;

        this.queue = { index: num, data: arr };

        if (data.length == 0) return;
        let t = data[num].url;
        console.log("Downloading: ", t);
        onplay(data[num].id);
        this.yt = ytdl(`https://www.youtube.com/watch?v=${t}`);
        this.command = ffmpeg(this.yt)
          .output("./temp/temp.wav")
          .noVideo()
          .format("wav")
          .outputOptions("-ar", "44100")
          .on("end", () => {
            this.command = null;
            this.yt = null;
            wavplayer
              .play({
                path: "./temp/temp.wav",
                sync: true
              })
              .then(
                () => {
                  console.log("The wav file played successfully.");
                  fs.unlink("./temp/temp.wav", err => {
                    if (err) console.log(err);
                  });
                  this.play(num + 1, data);
                },
                err => {
                  console.log(err);
                }
              )
              .catch(error => {
                console.error(error);
              });
          })
          .run();
      }
    }

    stop() {
      console.log("Stopping..");
      if (this.command) this.command.kill();
      if (this.yt) this.yt.destroy();
      if (!this.command && !this.yt) wavplayer.stop();
      fs.unlink("./temp/temp.wav", err => {
        if (err) console.log(err);
      });
      this.queue = { index: -1, data: [] };
    }

    getQueue() {
      return this.queue;
    }
  }

  return new Player();
};

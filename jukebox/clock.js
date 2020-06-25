const consts = require("./consts.js");

module.exports = function(db, player, io, onplay) {
  let playing = false;
  // passing over db

  function tick() {
    db.schedule.get((err, data) => {
      if (err) return console.log(err);
      let now = new Date();
      let day = (((now.getDay() - 1) % 7) + 7) % 7;
      try {
        let plays = data.json
          .split("\n")
          [day].substr(4)
          .split(";");
        if (plays[plays.length - 1] == "") plays.pop();
        plays = plays.map(el => {
          let s = el.split("-").map(el => {
            return el.split(":");
          });
          let start = new Date(),
            end = new Date();
          start.setMilliseconds(0);
          end.setMilliseconds(0);

          start.setSeconds(0);
          end.setSeconds(0);

          start.setHours(s[0][0]);
          end.setHours(s[1][0]);

          start.setMinutes(s[0][1]);
          end.setMinutes(s[1][1]);

          return [start, end];
        });

        let shouldPlay = false;
        //let currplay = player.isplaying();

        plays.forEach(el => {
          if (
            el[0].getTime() + consts.prePlayWait < now.getTime() &&
            now.getTime() + consts.afterPlayWait < el[1].getTime()
          )
            shouldPlay = true;
        });

        if (!playing && shouldPlay) {
          playing = true;
          player.play(0);
        }

        if (playing && !shouldPlay) {
          playing = false;
          player.stop();
          io.of("/dashboard").emit("started", {});
        }
      } catch (err) {
        return console.log("parsing failed:", err);
      }
    });
  }
  setInterval(tick, consts.refreshRate);
};

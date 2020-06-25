const { audio } = require("system-control");
let last = 0;
module.exports = function(loudness, fn) {
  if (loudness) {
    audio.volume(loudness);
    last = loudness;
  }

  if (fn) fn(last);
};

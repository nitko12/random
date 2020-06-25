const fs = require("fs");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const wavplayer = require("node-wav-player");
const consts = require("./consts.js");

module.exports = function(q, db, fn) {
  let url = `https://www.youtube.com/watch?v=${q}`;
  if (!ytdl.validateURL(url)) return fn(true, null);
  ytdl(url)
    .on("error", err => {
      console.log("Error with one yt link");
      fn(true, null);
    })
    .on("response", res => {
      if (parseInt(res.headers["content-length"]) > consts.maxYtVideoSize)
        return fn(true, null);
      return fn(null, null);
    });
};

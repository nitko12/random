const consts = require("./consts.js");
const tester = require("./link-tester.js");
const bcrypt = require("bcryptjs");
const volume = require("./volume.js");
const uuid = require("uuid/v4");
const safeCompare = require("safe-compare");

module.exports = function(io, player, db) {
  io.on("connection", socket => {});

  io.of("/changepass").on("connection", socket => {
    socket.on("change", (data, fn) => {
      if (!socket.request.user) return fn("lol no");
      if (
        !socket.request.user.logged_in ||
        safeCompare(socket.request.user.username, consts.admin.username)
      )
        return fn("lol no");
      if (!data.lastpass || !data.newpass) return fn({ accepted: false });
      db.user.findById(socket.request.user.id, (err, row) => {
        if (err) return console.log(err);
        bcrypt.compare(data.lastpass, row.password, (err, res) => {
          if (err || !res) return fn({ accepted: false });
          db.user.changePass(socket.request.user.id, data.newpass, err => {
            if (err) return fn({ accepted: false });
            return fn({ accepted: true });
          });
        });
      });
    });
  });
  io.of("/user").on("connection", socket => {
    socket.on("stepYear", fn => {
      if (
        !safeCompare(socket.request.user.username, consts.admin.username) ||
        !safeCompare(socket.request.user.password, consts.admin.password)
      )
        return fn("lol no");
      db.user.step((err, data) => {
        if (err) {
          console.log(err);
          return fn({ accepted: false });
        }
        fn({ accepted: true, data: data });
      });
    });
    socket.on("reqrefresh", fn => {
      if (
        !safeCompare(socket.request.user.username, consts.admin.username) ||
        !safeCompare(socket.request.user.password, consts.admin.password)
      )
        return fn("lol no");
      db.user.getAll((err, data) => {
        if (err) return console.log(err);
        fn(data);
      });
    });
    socket.on("set", (data, fn) => {
      if (
        (!safeCompare(socket.request.user.username, consts.admin.username) ||
          !safeCompare(socket.request.user.password, consts.admin.password)) &&
        (!safeCompare(
          socket.request.user.username,
          consts.superuser.username
        ) ||
          !safeCompare(socket.request.user.password, consts.superuser.password))
      )
        return fn("lol no");
      db.user.batch(data, err => {
        if (err) {
          console.log("Error while parsing user additions");
          return fn({ accepted: false });
        }
        fn({ accepted: true });
      });
    });
    socket.on("deletefromdb", (data, fn) => {
      if (
        !safeCompare(socket.request.user.username, consts.admin.username) ||
        !safeCompare(socket.request.user.password, consts.admin.password)
      )
        return fn("lol no");
      db.user.delete(data, (err, users) => {
        if (err) {
          console.log("Error while parsing user deletions");
          return fn({ accepted: false });
        }
        let userData = {};
        for (let i = 0; i < users.length; ++i)
          userData[i.toString()] = users[i];
        fn({ accepted: true, data: users }, data);
      });
    });
  });

  io.of("/recs").on("connection", function(socket) {
    socket.on("get", (msg, fn) => {
      if (
        !safeCompare(socket.request.user.username, consts.admin.username) ||
        !safeCompare(socket.request.user.password, consts.admin.password)
      )
        return fn("lol no");
      db.recs.getAll((err, data) => {
        if (err) return console.log(err);
        return fn(data);
      });
    });
    socket.on("add", (link, fn) => {
      if (
        !socket.request.user.logged_in ||
        safeCompare(socket.request.user.username, consts.admin.username)
      )
        return fn("lol no");
      let q;
      if (link.indexOf("?v=") != -1)
        q = link.substr(link.indexOf("?v=") + 3, 11);
      else if (link.indexOf("youtu.be/") != -1)
        q = link.substr(link.indexOf("youtu.be/") + 9, 11);
      else fn({ accepted: false });
      db.user.lastRecommend(socket.request.user.id, (err, data) => {
        if (
          data == "never" ||
          safeCompare(socket.request.user.id, consts.dj.id) ||
          new Date().getTime() - new Date(parseInt(data)).getTime() >=
            consts.recCooldown
        ) {
          let sid = uuid();
          tester(q, db, (err, data) => {
            if (err) return fn({ accepted: false });
            db.recs.add(
              sid,
              socket.request.user.id,
              q,
              new Date().getTime(),
              (err, data) => {
                if (err) {
                  console.log(err);
                  return fn({ accepted: false });
                }

                db.recs.getAll((err, data) => {
                  if (err) console.log(err);
                  io.of("/recs").emit("refresh", data);
                });

                if (safeCompare(socket.request.user.id, consts.dj.id)) {
                  let id = sid;
                  db.recs.get(id, (err, data) => {
                    if (err) return console.log(err);
                    if (!data) return console.log("Error while approving...");
                    db.queue.push(data.url, data.username, err => {
                      if (err) return console.log(err);
                      db.recs.remove(id, err => {
                        if (err) console.log(err);
                        db.recs.getAll((err, data) => {
                          if (err) console.log(err);
                          io.of("/recs").emit("refresh", data);
                          db.queue.getAll((err, data) => {
                            if (err) return console.log(err);
                            io.of("/queue").emit("refresh", data);
                          });
                        });
                      });
                    });
                  });
                }
                fn({ accepted: true });
              }
            );
          });
        } else {
          return fn({ accepted: false });
        }
      });
    });

    socket.on("approve", id => {
      if (
        !safeCompare(socket.request.user.username, consts.admin.username) ||
        !safeCompare(socket.request.user.password, consts.admin.password)
      )
        return fn("lol no");
      db.recs.get(id, (err, data) => {
        if (err) return console.log(err);
        if (!data) return console.log("Error while approving...");
        db.queue.push(data.url, data.username, err => {
          if (err) return console.log(err);
          db.recs.remove(id, err => {
            if (err) console.log(err);
            db.recs.getAll((err, data) => {
              if (err) console.log(err);
              io.of("/recs").emit("refresh", data);
              db.queue.getAll((err, data) => {
                if (err) return console.log(err);
                io.of("/queue").emit("refresh", data);
              });
            });
          });
        });
      });
    });

    socket.on("delete", id => {
      if (
        !safeCompare(socket.request.user.username, consts.admin.username) ||
        !safeCompare(socket.request.user.password, consts.admin.password)
      )
        return fn("lol no");
      db.recs.remove(id, err => {
        if (err) console.log(err);
        db.recs.getAll((err, data) => {
          if (err) console.log(err);
          io.of("/recs").emit("refresh", data);
        });
      });
    });
  });

  io.of("/schedule").on("connection", socket => {
    socket.on("get", (msg, fn) => {
      if (
        !safeCompare(socket.request.user.username, consts.admin.username) ||
        !safeCompare(socket.request.user.password, consts.admin.password)
      )
        return fn("lol no");
      db.schedule.get((err, data) => {
        if (err) return console.log(err);
        fn(data);
      });
    });
    socket.on("set", (data, fn) => {
      if (
        !safeCompare(socket.request.user.username, consts.admin.username) ||
        !safeCompare(socket.request.user.password, consts.admin.password)
      )
        return fn("lol no");
      db.schedule.set(data.json, err => {
        if (err) {
          console.log("Schedule set error: ", err);
          fn({ accepted: false });
        }
        fn({ accepted: true });
      });
    });
  });

  io.of("/queue").on("connection", socket => {
    socket.on("get", (data, fn) => {
      if (!socket.request.user.logged_in) return fn("lol no");
      db.queue.getAll((err, data) => {
        if (err) return console.log(err);
        fn(data);
      });
    });

    socket.on("delete", (id, fn) => {
      if (!id) return fn(true);
      if (!socket.request.user.logged_in) return fn("lol no");
      db.queue.remove(id, err => {
        if (err) return console.log(err);
        db.queue.getAll((err, data) => {
          if (err) return console.log(err);
          io.of("/queue").emit("refresh", data);
        });
      });
    });

    socket.on("vote", (id, fn) => {
      if (!id) return fn(true);
      if (!socket.request.user.logged_in) return fn("lol no");
      db.user.lastVote(socket.request.user.id, (err, data) => {
        if (err) {
          fn({ accepted: false });
          return console.log(err);
        }
        if (
          data == "never" ||
          safeCompare(socket.request.user.id, consts.dj.id) ||
          new Date().getTime() - new Date(parseInt(data)).getTime() >=
            consts.voteCooldown
        ) {
          db.queue.vote(
            id,
            socket.request.user.id,
            new Date().getTime(),
            (data, err) => {
              if (err) {
                fn({ accepted: false });
                return console.log(err);
              }
              fn({ accepted: true });
              db.queue.getAll((err, data) => {
                if (err) return console.log(err);
                io.of("/queue").emit("refresh", data);
              });
            }
          );
        } else {
          fn({ accepted: false });
          return console.log(err);
        }
      });
    });
  });

  io.of("/publicqueue").on("connection", socket => {
    socket.on("get", (data, fn) => {
      db.queue.getAll((err, data) => {
        if (err) return console.log(err);
        data.sort((a, b) => parseInt(b.votes) - parseInt(a.votes));
        fn(data.splice(0, 5));
      });
    });
  });

  io.of("/usertext").on("connection", socket => {
    socket.on("get", (data, fn) => {
      db.usertext.get((err, data) => {
        if (err) return console.log(err);
        fn(data.data);
      });
    });

    socket.on("set", (data, fn) => {
      if (
        !safeCompare(socket.request.user.username, consts.admin.username) ||
        !safeCompare(socket.request.user.password, consts.admin.password)
      )
        return fn("lol no");
      db.usertext.set(data, err => {
        db.usertext.get((err, data) => {
          if (err) return console.log(err);
          io.of("/usertext").emit("refresh", data.data);
          io.of("/usertextpublic").emit("refresh", data.data);
          fn(data.data);
        });
      });
    });
  });

  io.of("/usertextpublic").on("connection", socket => {
    socket.on("get", (data, fn) => {
      db.usertext.get((err, data) => {
        if (err) return console.log(err);
        io.of("/usertext").emit("refresh", data.data);
        io.of("/usertextpublic").emit("refresh", data.data);
        fn(data.data);
      });
    });
  });

  io.of("/usertext2").on("connection", socket => {
    socket.on("get", fn => {
      db.usertext2.get((err, data) => {
        if (err) return console.log(err);
        fn(data.data);
        socket.emit("refresh", data.data);
      });
    });
    socket.on("set", (data, fn) => {
      if (
        !safeCompare(socket.request.user.username, consts.admin.username) ||
        !safeCompare(socket.request.user.password, consts.admin.password)
      )
        return fn("lol no");
      db.usertext2.set(data, err => {
        if (err) return console.log(err);
        io.of("/usertext2").emit("refresh", data);
      });
    });
  });

  io.of("/dashboard").on("connection", socket => {
    // not tested
    socket.emit("time", new Date().getTime());

    socket.on("getQueue", fn => {
      if (
        !safeCompare(socket.request.user.username, consts.admin.username) ||
        !safeCompare(socket.request.user.password, consts.admin.password)
      )
        return fn("lol no");
      fn(player.getQueue());
    });

    socket.on("setVolume", (data, fn) => {
      if (
        !safeCompare(socket.request.user.username, consts.admin.username) ||
        !safeCompare(socket.request.user.password, consts.admin.password)
      )
        return fn("lol no");
      volume(data);
      console.log("setting volume to " + data);
    });
    socket.on("getVolume", fn => {
      if (
        !safeCompare(socket.request.user.username, consts.admin.username) ||
        !safeCompare(socket.request.user.password, consts.admin.password)
      )
        return;
      volume(undefined, fn);
    });
  });
};

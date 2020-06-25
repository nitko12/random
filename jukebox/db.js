const consts = require("./consts.js");
var sqlite3 = require("sqlite3").verbose();
const uuid = require("uuid/v4");
const bcrypt = require("bcryptjs");
const safeCompare = require("safe-compare");

class User {
  constructor(db) {
    this.db = db;
  }

  findByArgs(args, fn) {
    this.db.get(
      `SELECT * FROM "users" WHERE username = ?`,
      args.username,
      (err, row) => {
        if (err) return fn(err);
        if (!row) return fn(null, false);
        bcrypt.compare(args.password, row.password, (err, res) => {
          if (err) return fn(err);
          if (res) return fn(null, row);
          return fn(null, false);
        });
      }
    );
  }

  findById(id, fn) {
    this.db.get(`SELECT * FROM "users" WHERE id = ?`, id, (err, row) => {
      if (err) return fn(err);
      fn(null, row);
    });
  }

  add(id, args, fn) {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) return console.log(err);
      bcrypt.hash(args.password, salt, (err, hash) => {
        if (err) return console.log(err);
        this.db.run(
          `INSERT INTO "users" VALUES (?, ?, ?, ?, ?, ?) `,
          id,
          args.username,
          hash,
          "never",
          "never",
          args.raz,
          fn
        );
      });
    });
  }

  getAll(fn) {
    this.db.all(`SELECT * FROM "users"`, (err, rows) => {
      if (err) return fn(err);
      return fn(err, rows);
    });
  }

  batch(data, fn) {
    // test if usernames distinct
    let set = new Set(),
      cnt = 0;

    let next = () => {
      // all clear
      for (let i in data) {
        this.add(
          uuid(),
          {
            username: data[i].username,
            password: data[i].password,
            raz:
              data[i].god == "osoblje" ? "osoblje" : data[i].god + data[i].raz
          },
          err => {
            if (err) {
              console.log(err);
              return fn(true);
            }
          }
        );
      }

      fn(null); // done
    };

    for (let i in data) {
      set.add(data[i].username);
      this.db.get(
        `SELECT * FROM "users" WHERE username = ?`,
        data[i].username,
        (err, row) => {
          if (err) {
            console.log(err);
            return fn(true);
          }
          if (row) return fn(true);
          ++cnt;
          if (cnt == Object.keys(data).length) {
            if (set.size != Object.keys(data).length) return fn(true);
            next();
          }
        }
      );
    }
  }

  delete(args, fn) {
    let next = () => {
      let cnt = 0;
      args.ids.forEach(el => {
        this.db.get(
          `SELECT * FROM "users" WHERE username = ?`,
          el.username,
          (err, row) => {
            if (err) {
              console.log(err);
              return fn(true);
            }
            this.db.run(
              `DELETE FROM "users" WHERE username = ?;`,
              row.username,
              err => {
                if (err) {
                  console.log(err);
                  return fn(true);
                }
                ++cnt;
                if (cnt == args.ids.length) {
                  this.getAll((err, data) => {
                    if (err) return console.log(err);
                    fn(null, data);
                  });
                }
              }
            );
          }
        );
      });
    };

    let set = new Set(),
      cnt = 0;

    args.ids.forEach(el => {
      this.db.get(
        `SELECT * FROM "users" WHERE username = ?`,
        el.username,
        (err, row) => {
          set.add(el.username);
          if (err) {
            console.log(err);
            return fn(true);
          }
          if (!row) return fn(true);
          ++cnt;
          if (cnt == args.ids.length) {
            if (set.size != args.ids.length) return fn(true);
            next();
          }
        }
      );
    });
  }

  lastRecommend(id, fn) {
    if (safeCompare(id, consts.dj.id)) return fn(null, "never");
    this.db.get(`SELECT * FROM "users" WHERE id = ?`, id, (err, row) => {
      if (err) return fn(err);
      fn(err, row.lastrecommend);
    });
  }

  lastVote(id, fn) {
    if (safeCompare(id, consts.dj.id)) return fn(null, "never");
    this.db.get(`SELECT * FROM "users" WHERE id = ?`, id, (err, row) => {
      if (err) return fn(err);
      fn(err, row.lastvote);
    });
  }

  step(fn) {
    this.db.run(
      `UPDATE users SET class = CAST((CAST(SUBSTR(class, 1, 1) as integer) + 1) as text) || SUBSTR(class, 2, 1) WHERE class != "osoblje"`,
      err => {
        if (err) return fn(err);
        this.db.run(
          `DELETE FROM users WHERE CAST(SUBSTR(class, 1, 1) AS INTEGER) >= 5;`,
          err => {
            if (err) return fn(err);
            this.getAll((err, data) => {
              if (err) return fn(err);
              fn(err, data);
            });
          }
        );
      }
    );
  }

  changePass(id, password, fn) {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) return console.log(err);
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) return console.log(err);
        this.db.run(
          `UPDATE "users" SET password = ? WHERE id = ?`,
          hash,
          id,
          fn
        );
      });
    });
  }
}

class Recs {
  constructor(db, findUserById) {
    this.db = db;
    this.findUserById = findUserById;
  }

  add(sid, id, url, date, fn) {
    if (id != consts.dj.id)
      this.db.run(
        `UPDATE "users" SET lastrecommend = ? WHERE id = ?`,
        date,
        id,
        err => {
          if (err) return fn(err);
          this.db.run(
            `INSERT INTO "recommendations" VALUES (?, ?, ?, ?)`,
            sid,
            id,
            url,
            date,
            fn
          );
        }
      );
    else {
      this.db.run(
        `INSERT INTO "recommendations" VALUES (?, ?, ?, ?)`,
        sid,
        id,
        url,
        date,
        fn
      );
    }
  }

  getAll(fn) {
    this.db.all(`SELECT * FROM "recommendations"`, (err, rows) => {
      if (err) return fn(err);
      let data = [];
      rows.forEach(el => {
        if (safeCompare(el.userid, consts.dj.id))
          return data.push({
            id: el.id,
            username: consts.dj.username,
            date: el.date,
            url: el.url
          });
        this.findUserById(el.userid, (err, user) => {
          if (err) return fn(err);
          data.push({
            id: el.id,
            username: user.username,
            date: el.date,
            url: el.url
          });
          if (data.length == rows.length) {
            return fn(err, data);
          }
        });
      });
      if (data.length == rows.length) {
        return fn(err, data);
      }
    });
  }

  remove(id, fn) {
    this.db.run(`DELETE FROM "recommendations" WHERE id = ?`, id, fn);
  }

  get(id, fn) {
    this.db.get(
      `SELECT * FROM "recommendations" WHERE id = ?`,
      id,
      (err, row) => {
        if (err) return fn(err);
        if (!row) return fn(true);
        if (safeCompare(row.userid, consts.dj.id))
          return fn(null, {
            id: consts.dj.id,
            username: consts.dj.username,
            date: row.date,
            url: row.url
          });
        this.findUserById(row.userid, (err, user) => {
          if (err) return fn(err);
          let data = {
            id: row.id,
            username: user.username,
            date: row.date,
            url: row.url
          };
          fn(null, data);
        });
      }
    );
  }
}

class Schedule {
  constructor(db) {
    this.db = db;
  }

  test(data) {
    // clone of the real playing function
    try {
      let now = new Date();
      let day = (((now.getDay() - 1) % 7) + 7) % 7;

      if (
        data.split("\n").length -
          (data.split("\n")[data.split("\n").length - 1] == "") !=
        7
      )
        return false;

      let plays = data
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
      return true;
    } catch (err) {
      return false;
    }
  }

  set(obj, fn) {
    if (!this.test(obj)) return fn("Wrong formatting");
    this.db.run(`UPDATE "schedule" SET json = ? WHERE 1`, obj, fn);
  }

  get(fn) {
    this.db.get(`SELECT * FROM "schedule"`, fn);
  }
}

class Queue {
  constructor(db) {
    this.db = db;
  }

  getAll(fn) {
    this.db.all(`SELECT * FROM "queue"`, (err, rows) => {
      if (err) return fn(err);
      return fn(null, rows);
    });
  }

  push(url, submittedBy, fn) {
    this.db.run(
      `INSERT INTO "queue" VALUES (?, ?, ?, ?)`,
      uuid(),
      url,
      submittedBy,
      0,
      fn
    );
  }

  vote(id, userId, date, fn) {
    this.db.run(
      `UPDATE "queue" SET votes = votes + 1 WHERE id = ?`,
      id,
      (err, data) => {
        if (err) return fn(err);
        if (safeCompare(id, consts.dj.id)) return fn(null);
        this.db.run(
          `UPDATE "users" SET lastvote = ? WHERE id = ?`,
          date,
          userId,
          fn
        );
      }
    );
  }

  half(id, fn) {
    this.db.run(`UPDATE "queue" SET votes = 0 WHERE id = ?`, id, fn);
  }

  remove(id, fn) {
    this.db.run(`DELETE FROM "queue" WHERE id = ?`, id, fn);
  }
}

class Usertext {
  constructor(db) {
    this.db = db;
  }
  set(data, fn) {
    this.db.run(`UPDATE "usertext" SET data = ? WHERE id = "1"`, data, fn);
  }
  get(fn) {
    this.db.get(`SELECT * FROM "usertext"`, fn);
  }
}

class Usertext2 {
  constructor(db) {
    this.db = db;
  }
  set(data, fn) {
    this.db.run(`UPDATE "usertext2" SET data = ? WHERE id = "1"`, data, fn);
  }
  get(fn) {
    this.db.get(`SELECT * FROM "usertext2"`, fn);
  }
}

class Db {
  constructor() {
    this.db = new sqlite3.Database("./db.sqlite3");
    this.db.serialize(() => {
      this.db.run(
        `CREATE TABLE IF NOT EXISTS "users" (id TEXT, username TEXT UNIQUE, password TEXT, lastrecommend TEXT, lastvote TEXT, class TEXT)`,
        err => {
          if (err) return console.log(err);
        }
      );
      this.db.run(
        `CREATE TABLE IF NOT EXISTS "recommendations" (id TEXT, userid TEXT, url TEXT, date TEXT)`,
        err => {
          if (err) return console.log(err);
        }
      );
      this.db.run(
        `CREATE TABLE IF NOT EXISTS "schedule" (id TEXT, json TEXT)`,
        err => {
          if (err) return console.log(err);
        }
      );
      this.db.run(
        `CREATE TABLE IF NOT EXISTS "queue" (id TEXT, url TEXT, submittedBy TEXT, votes INTEGER)`,
        err => {
          if (err) return console.log(err);
        }
      );
      this.db.run(
        `CREATE TABLE IF NOT EXISTS "usertext" (id TEXT, data TEXT)`,
        err => {
          if (err) return console.log(err);
        }
      );
      this.db.run(
        `CREATE TABLE IF NOT EXISTS "usertext2" (id TEXT, data TEXT)`,
        err => {
          if (err) return console.log(err);
        }
      );
      this.db.get(`SELECT 1 FROM "schedule"`, (err, row) => {
        if (err) return console.log(err);
        if (!row)
          this.db.run(
            `INSERT INTO "schedule" VALUES (?, ?)`,
            uuid(),
            consts.defaultSchedule,
            err => {
              if (err) return console.log(err);
            }
          );
      });
      this.db.get(`SELECT 1 FROM "usertext"`, (err, row) => {
        if (err) return console.log(err);
        if (!row)
          this.db.run(
            `INSERT INTO "usertext" VALUES ("1", ?)`,
            "Default text",
            err => {
              if (err) return console.log(err);
            }
          );
      });
      this.db.get(`SELECT 1 FROM "usertext2"`, (err, row) => {
        if (err) return console.log(err);
        if (!row)
          this.db.run(
            `INSERT INTO "usertext2" VALUES ("1", ?)`,
            "Default text",
            err => {
              if (err) return console.log(err);
            }
          );
      });
    });
    this.user = new User(this.db);
    this.recs = new Recs(this.db, this.user.findById);
    this.schedule = new Schedule(this.db);
    this.queue = new Queue(this.db);
    this.usertext = new Usertext(this.db);
    this.usertext2 = new Usertext2(this.db);
  }
}

module.exports = new Db();

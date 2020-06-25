const ejs = require("ejs");
const consts = require("./consts.js");
const cors = require("cors");
const safeCompare = require("safe-compare");

module.exports = function(express, app, passport) {
  app.use("/public", express.static("./public"));
  app.use("/slike", express.static("./slike"));
  app.use(cors());

  app.use("/favicon.ico", express.static("./public/favicon.ico"));

  app.get("/", (req, res) => {
    if (
      req.isAuthenticated() &&
      safeCompare(req.user.username, consts.admin.username) &&
      safeCompare(req.user.password, consts.admin.password)
    ) {
      let data = [],
        options = [];
      ejs.renderFile("./ejs/admin.ejs", data, options, (err, str) => {
        if (err) return console.log(err);
        res.send(str);
      });
    } else if (
      req.isAuthenticated() &&
      safeCompare(req.user.username, consts.superuser.username) &&
      safeCompare(req.user.password, consts.superuser.password)
    ) {
      let data = { user: req.user.username },
        options = [];
      ejs.renderFile(
        "./ejs/dodajkorisnika_su.ejs",
        data,
        options,
        (err, str) => {
          if (err) return console.log(err);
          res.send(str);
        }
      );
    } else if (
      req.isAuthenticated() &&
      safeCompare(req.user.username, consts.dj.username) &&
      safeCompare(req.user.password, consts.dj.password)
    ) {
      let data = { user: req.user.username },
        options = [];
      ejs.renderFile("./ejs/prijavljeni_dj.ejs", data, options, (err, str) => {
        if (err) return console.log(err);
        res.send(str);
      });
    } else if (req.isAuthenticated()) {
      let data = { user: req.user.username },
        options = [];
      ejs.renderFile("./ejs/prijavljeni.ejs", data, options, (err, str) => {
        if (err) return console.log(err);
        res.send(str);
      });
    } else {
      let data = [],
        options = [];
      ejs.renderFile("./ejs/neprijavljeni.ejs", data, options, (err, str) => {
        if (err) return console.log(err);
        res.send(str);
      });
    }
  });

  app.get("/loginsite", (req, res) => {
    let data = [],
      options = [];
    ejs.renderFile("./ejs/loginsite.ejs", data, options, (err, str) => {
      if (err) return console.log(err);
      res.send(str);
    });
  });

  app.post("/login", (req, res, next) => {
    if (req.isAuthenticated()) return res.redirect("/");
    passport.authenticate("local", (err, user, info) => {
      if (err) return console.log(err);
      if (!user) return res.redirect("/?login=0");
      req.login(user, err => {
        return res.redirect("/");
      });
    })(req, res, next);
  });

  app.post("/logout", (req, res, next) => {
    if (!req.isAuthenticated()) return res.redirect("/");
    req.logout();
    res.redirect("/");
  });

  app.get("/raspored", (req, res) => {
    if (
      req.isAuthenticated() &&
      safeCompare(req.user.username, consts.admin.username) &&
      safeCompare(req.user.password, consts.admin.password)
    ) {
      let data = [],
        options = [];
      ejs.renderFile("./ejs/raspored.ejs", data, options, (err, str) => {
        if (err) return console.log(err);
        res.send(str);
      });
    } else {
      res.status(403).end();
    }
  });

  app.get("/dodajkorisnika", (req, res) => {
    if (
      req.isAuthenticated() &&
      safeCompare(req.user.username, consts.admin.username) &&
      safeCompare(req.user.password, consts.admin.password)
    ) {
      let data = [],
        options = [];
      ejs.renderFile("./ejs/dodajkorisnika.ejs", data, options, (err, str) => {
        if (err) return console.log(err);
        res.send(str);
      });
    } else {
      res.status(403).end();
    }
  });

  app.get("/predlozi", (req, res) => {
    if (
      req.isAuthenticated() &&
      safeCompare(req.user.username, consts.dj.username) &&
      safeCompare(req.user.password, consts.dj.password)
    ) {
      let data = { user: req.user.username },
        options = [];
      ejs.renderFile("./ejs/predlozi_dj.ejs", data, options, (err, str) => {
        if (err) return console.log(err);
        res.send(str);
      });
    } else if (req.isAuthenticated()) {
      let data = { user: req.user.username },
        options = [];
      ejs.renderFile("./ejs/predlozi.ejs", data, options, (err, str) => {
        if (err) return console.log(err);
        res.send(str);
      });
    } else {
      res.status(403).end();
    }
  });

  app.get("/promjenisifru", (req, res) => {
    if (
      req.isAuthenticated() &&
      !safeCompare(req.user.username, consts.dj.username) &&
      !safeCompare(req.user.username, consts.superuser.username) &&
      !safeCompare(req.user.username, consts.admin.username)
    ) {
      let data = { user: req.user.username },
        options = [];
      ejs.renderFile("./ejs/changepass.ejs", data, options, (err, str) => {
        if (err) return console.log(err);
        res.send(str);
      });
    } else {
      res.status(403).end();
    }
  });

  // restricted js
  app.get("/restricted/admin.js", (req, res) => {
    if (
      req.isAuthenticated() &&
      safeCompare(req.user.username, consts.admin.username) &&
      safeCompare(req.user.password, consts.admin.password)
    ) {
      res.sendFile(__dirname + "/restricted/admin.js");
    } else {
      res.status(403).end();
    }
  });

  app.get("/restricted/raspored.js", (req, res) => {
    if (
      req.isAuthenticated() &&
      safeCompare(req.user.username, consts.admin.username) &&
      safeCompare(req.user.password, consts.admin.password)
    ) {
      res.sendFile(__dirname + "/restricted/raspored.js");
    } else {
      res.status(403).end();
    }
  });

  app.get("/restricted/adduser.js", (req, res) => {
    if (
      (req.isAuthenticated() &&
        safeCompare(req.user.username, consts.admin.username) &&
        safeCompare(req.user.password, consts.admin.password)) ||
      (req.isAuthenticated() &&
        safeCompare(req.user.username, consts.superuser.username) &&
        safeCompare(req.user.password, consts.superuser.password))
    ) {
      res.sendFile(__dirname + "/restricted/adduser.js");
    } else {
      res.status(403).end();
    }
  });

  // user js
  app.get("/user/recommend.js", (req, res) => {
    if (req.isAuthenticated()) {
      res.sendFile(__dirname + "/user/recommend.js");
    } else {
      res.status(403).end();
    }
  });

  app.get("/user/loggedin.js", (req, res) => {
    if (req.isAuthenticated()) {
      res.sendFile(__dirname + "/user/loggedin.js");
    } else {
      res.status(403).end();
    }
  });

  app.get("/user/changepass.js", (req, res) => {
    if (req.isAuthenticated()) {
      res.sendFile(__dirname + "/user/changepass.js");
    } else {
      res.status(403).end();
    }
  });
};

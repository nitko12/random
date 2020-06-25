module.exports = {
  port: 8080,
  defaultSchedule:
    `mon:8:36-8:49;10:26-10:34;14:36-14:49;23:33-23:34;\n` +
    `tue:0:41-0:42;10:26-10:34;14:36-14:49;16:36-16:49;\n` +
    `wed:8:36-8:49;10:26-10:34;14:36-14:49;16:36-16:49;\n` +
    `thu:8:36-8:49;10:26-10:34;14:36-14:49;16:36-16:49;\n` +
    `fri:8:36-8:49;10:26-10:34;14:36-14:49;16:36-16:49;\n` +
    `sat:8:36-8:49;10:26-10:34;14:36-14:49;15:36-16:49;\n` +
    `sun:8:36-8:49;10:26-10:34;14:36-14:49;16:28-16:29;\n`,
  refreshRate: 1000, // ms
  admin: {
    id: "2f24vvg",
    username: "admin",
    password: "admin",
    lastrecommend: "never"
  },
  superuser: {
    id: "341djhi",
    username: "superuser",
    password: "krava",
    lastrecommend: "never"
  },
  dj: {
    id: "40dfso42",
    username: "dj",
    password: "nitko",
    lastrecommend: "never"
  },
  sessionKey: "nDG3c7gcnl",
  sessionSecret: "yep8hLJP2Z",
  maxYtVideoSize: 50 * 1024 * 1024, // bytes
  recCooldown: 1000 * 10 * 1000, // ms
  voteCooldown: 1000 * 10 * 1000, // ms
  prePlayWait: 1000 * 20, // ms
  afterPlayWait: 1000 * 20 // ms
};

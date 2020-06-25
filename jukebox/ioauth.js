const consts = require("./consts.js");
module.exports = function(io, passportSocketIo, sessionStore) {
  io.origins("*:*");

  let options = {
    cookieParser: require("cookie-parser"),
    key: consts.sessionKey,
    secret: consts.sessionSecret,
    store: sessionStore,
    success: onAuthorizeSuccess,
    fail: onAuthorizeFail
  };

  io.of("/usertext").use(passportSocketIo.authorize(options));
  io.of("/usertext2").use(passportSocketIo.authorize(options));
  io.of("/changepass").use(passportSocketIo.authorize(options));
  io.of("/queue").use(passportSocketIo.authorize(options));
  io.of("/schedule").use(passportSocketIo.authorize(options));
  io.of("/recs").use(passportSocketIo.authorize(options));
  io.of("/user").use(passportSocketIo.authorize(options));
  io.of("/dashboard").use(passportSocketIo.authorize(options));
};

function onAuthorizeSuccess(data, accept) {
  accept();
}

function onAuthorizeFail(data, message, error, accept) {
  if (error) accept(new Error(message));
}

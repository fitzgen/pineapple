/*jslint onevar: true, undef: true, eqeqeq: true, bitwise: true,
  newcap: true, immed: true, nomen: false, white: false, plusplus: false,
  laxbreak: true */

/*global require, module, __dirname */

var connect = require("connect"),
    omega = require("../lib/omega");

connect.createServer(
    connect.logger(),
    connect.bodyDecoder(),
    connect.cookieDecoder(),
    connect.session({
        store: new connect.session.MemoryStore()
    }),
    omega({
        lib: __dirname + "/todo/",
        template: __dirname + "/todo/todo.html"
    })
).listen(8000);
/*jslint onevar: true, undef: true, eqeqeq: true, bitwise: true,
  newcap: true, immed: true, nomen: false, white: false, plusplus: false,
  laxbreak: true */

/*global require, module */

var
connect = require("connect"),
omega = require("./omega");

connect.createServer(
    connect.cookieDecoder(),
    connect.session({
        store: new connect.session.MemoryStore()
    }),
    omega(),
    function (request, response) {
        response.writeHead(200, { "Content-Type": "text/html" });
        response.end(request.session.document.innerHTML);
    }
).listen(8000);
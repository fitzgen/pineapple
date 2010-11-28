/*jslint onevar: true, undef: true, eqeqeq: true, bitwise: true,
  newcap: true, immed: true, nomen: false, white: false, plusplus: false,
  laxbreak: true */

/*global require, module, process */

var jsdom   = require("jsdom"),
    fs      = require("fs"),
    path    = require("path"),
    url     = require("url"),
    Script  = process.binding("evals").Script,
    connect = require("connect");

function concatLibScripts (dir) {
    return fs.readdirSync(dir)
             .filter(function (f) { return f.match(/\.js$/); })
             .map(function (f) { return fs.readFileSync(path.join(dir, f)); })
             .join("\n");
}

module.exports = function (opts) {
    opts         = opts          || {};
    var jQuery   = opts.jQuery   || "http://code.jquery.com/jquery-1.4.2.min.js",
        routes   = opts.routes   || "routes",
        template = fs.readFileSync(opts.template),
        src      = new Script(concatLibScripts(opts.lib));

    return function (req, res, next) {
        var document = req.session.document,
            window   = req.session.window,
            status   = 200,
            routeFn, urlPath;

        if ( ! (document || window) ) {
            document = req.session.document = jsdom.jsdom(template);
            window   = req.session.window   = document.createWindow();
            src.runInNewContext(window);
        }

        urlPath = url.parse(req.url, true);
        routeFn = window[routes][req.method + " " + urlPath.pathname] || (function () {
            status = 404;
            return window[routes][404] || function () {
                document.innerHTML = "<h1>No route for '" + urlPath.pathname + "'</h1>";
            };
        }());

        routeFn.call(window, req.body);

        res.writeHead(status, { "Content-Type": "text/html" });
        res.end(document.innerHTML);
    };
};

// ### Routes

(function () {

    // Hold on to a reference to the current route object so that we can call
    // the `exit` method when the time comes.
    var currentRoute;

    var routes = {
        __missing__: {
            enter : function () {},
            exit  : function () {}
        }
    };

    var routeEmitter = {};
    mixin(routeEmitter, eventEmitter);

    app.defineRoute = function (reString, opts) {
        routes[reString] = opts;
        return this;
    };

    app.redirect = function (hash) {
        hash = hash.replace(/^[#]+/, "#");

        // Manually publish the hashchange message if we are redirecting to
        // the same place we already are to force a "reload".
        window.location.hash === hash
            ? routeEmitter.trigger("hashchange", hash)
            : window.location.hash = hash;
    };

    routeEmitter.bind("hashchange", function (hash) {
        var reString, matches;

        currentRoute && currentRoute.exit && currentRoute.exit();

        for (reString in routes) if (routes.hasOwnProperty(reString)) {
            var matches = hash.match(new RegExp(reString));
            if (matches) {
                routes[reString].enter && routes[reString].enter.apply(window.location.hash,
                                                                       matches);
                currentRoute = routes[reString];
                return;
            }
        }

        // No match was found.
        routes.__missing__.enter(window.location.hash);
        currentRoute = routes.__missing__;
    });

    // TODO: Cross browser back button history.
    if ("onhashchange" in window)
        window.addEventListener("hashchange", function () {
            app.publish("hashchange", window.location.hash);
        }, false);
    else
        (function () {
            var hash = window.location.hash;
            setInterval(function () {
                if (hash !== window.location.hash)
                    routeEmitter.trigger("hashchange", hash = window.location.hash);
            }, 150);
        }());

}());
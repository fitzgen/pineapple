// ### Routes

(function () {

    var currentView, routes = {
        __missing__: {
            enter : function () {},
            exit  : function () {}
        }
    };

    app.defineRoute = function (reString, view) {
        routes[reString] = view;
        return this;
    };

    app.redirect = function (hash) {
        hash = hash.replace(/^[#]+/, "#");

        // Manually publish the hashchange message if we are redirecting to
        // the same place we already are to force a "reload".
        window.location.hash === hash ?
            app.publish("hashchange", hash) :
            window.location.hash = hash;
    };

    app.subscribe("hashchange", function (hash) {
        var reString, matches;

        currentView && currentView.exit && currentView.exit();

        for (reString in routes) if (routes.hasOwnProperty(reString)) {
            var matches = hash.match(new RegExp(reString));
            if (matches) {
                routes[reString].enter && routes[reString].enter.apply(window.location.hash,
                                                                       matches);
                currentView = routes[reString];
                return;
            }
        }

        // No match was found.
        routes.__missing__.enter(window.location.hash);
        currentView = routes.__missing__;
    });

    // TODO: Cross browser
    window.addEventListener("hashchange", function () {
        app.publish("hashchange", window.location.hash);
    }, false);

}());
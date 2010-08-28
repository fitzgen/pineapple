window["pineapple"] = function () {
    if ( !(this instanceof pineapple) )
        return new pineapple();

    // ### Private methods and variables

    var undefined, app = this;

    function async (f) {
        setTimeout(f, 20);
    }

    // ### Pub/Sub

    (function () {

        var handlers = {};

        app.publish = function (signal) {
            var args = Array.prototype.slice.call(arguments, 1);
            async(function () {
                var subscribers, i, len;
                if ( subscribers = handlers[signal] )
                    for ( i = 0, len = subscribers.length; i < len; i++ )
                        subscribers[i].apply(signal, args);
            });
            return this;
        };

        app.subscribe = function (signal, func) {
            handlers[signal] = handlers[signal] || [];
            handlers[signal].push(func);
            return this;
        };

    }());

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

    // Modules

    (function () {

        app.modules = {};

        app.defineModule = function (name, constructor) {
            app.modules[name] = constructor;
            return this;
        };

    }());

    $(document).ready(function () {
        app.publish("ready");
    });
};
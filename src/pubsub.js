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


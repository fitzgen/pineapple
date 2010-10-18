// ### Events

var eventEmitter = {
    bind: function (event, callback) {
        this._eventHandlers = this._eventHandlers        || {};
        var handlers        = this._eventHandlers[event] || (this._eventHandlers[event] = []);
        handlers.push(callback);
        return this;
    },
    unbind: function (event, callback) {
        var handlers, i, len;
        switch (arguments.length) {
        case 0:
            delete this._eventHandlers;
            return this;
        case 1:
            this._eventHandlers = this._eventHandlers || {};
            delete this._eventHandlers[event];
            return this;
        case 2:
            this._eventHandlers = this._eventHandlers        || {};
            handlers            = this._eventHandlers[event] || [];
            for (i = 0, len = handlers.length; i < len; i++) {
                if (handlers[i] === callback) {
                    handlers.splice(i, 1);
                    break;
                }
            }
            return this;
        default:
            throw new Error("Too many arguments to `unbind`: " + arguments.length);
        }
    },
    trigger: function (event) {
        if ( ! (this._eventHandlers || (this._eventHandlers = {}))[event] )
            return this;
        var args = slice(arguments, 1),
            self = this;
        for ( var i = 0, len = this._eventHandlers[event].length; i < len; i++ )
            (function  (handler) {
                async(function () {
                    handler.apply({}, args);
                });
            }(this._eventHandlers[event][i]));
        return this;
    }
};
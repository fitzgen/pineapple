window["pineapple"] = function () {
    if ( ! (this instanceof window.pineapple) )
        return new window.pineapple();

    // ### Private methods and variables

    var undefined, app = this;

    function async (f) {
        setTimeout(f, 20);
    }

    function slice (obj, i) {
        return Array.prototype.slice.call(obj, i || 0);
    }

    function mixin (target, props) {
        for (var k in props)
            if (props.hasOwnProperty(k))
                target[k] = props[k];
    }

    function bindSelf (obj) {
        // Bind `this` as first argument to all methods, I hate it when I have
        // to `var that = this` because of object literals. No more!
        var oldMethod;
        for (var k in obj)
            if (obj.hasOwnProperty(k) && typeof obj[k] === "function") {
                oldMethod = obj[k];
                obj[k] = function () {
                    return oldMethod.apply(this, [this].concat(slice(arguments)));
                }
            }
    }

    // Borrowed from Backbone.js, Copyright Jeremy Ashkenas and Document Cloud,
    // MIT licensed.
    function inherits (parent, protoProps, ctorProps) {
        var child = protoProps.hasOwnProperty('constructor')
            ? protoProps.constructor
            : function () {
                return parent.apply(this, arguments);
            };

        var ctor = function () {};
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();

        mixin(child.prototype, protoProps);
        ctorProps && mixin(child, ctorProps);
        child.prototype.constructor = child;

        return child;
    }
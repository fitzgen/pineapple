// ### Views

(function () {

    app.views = {};

    var $ = window.$;
    function localJQuery (selector, context) {
        return arguments.length === 1
            ? $(selector, this.el)
            : $(this.el).find(context).find(selector);
    }

    var BaseView = app.views.BaseView = function (opts) {
        opts = opts || {};
        this.el = typeof opts.el === "undefined"
            ? document.createElement(this.el || this.defaultElement)
            : opts.el instanceof HTMLElement
                ? opts.el
                : opts.el instanceof $
                    ? opts.el[0]
                    : document.createElement(opts.el);
        this.$(this.el).hide();
        this.parent = typeof opts.parent === "undefined"
            ? document.body
            : opts.parent instanceof BaseView
                ? opts.parent.el
                : opts.parent;
        this.initialize(opts);
    };
    BaseView.prototype = {
        constructor: BaseView,
        defaultElement: "div",

        // Create elements, set up properties shared by the other methods
        initialize: function () {},

        // Show elements, enable form inputs, bind event handlers, etc.
        activate: function () {
            this.delegate();
            $(this.el).show().appendTo(this.parent);
            return this;
        },

        delegate: function () {
            var self = this;

            for (var key in this.events) if (this.events.hasOwnProperty(key)) (function (key) {
                var event, selector, val, idx;

                // Parse the event and selector out of the key.
                key = $.trim(key).replace(/ +/g, " ");
                idx = key.indexOf(" ");
                if (idx > -1) {
                    event = key.slice(0, idx);
                    selector = key.slice(idx + 1);
                } else {
                    event = key;
                    selector = false;
                }

                // If the user passed in a function, delegate events directly to
                // that function. If they passed in a string, trigger that event
                // on this view. If they didn't pass a selector, bind instead of
                // delegate.
                var handler = function (event) {
                    var val;
                    try {
                        val = self.valueOf();
                    } catch (err) {
                        val = err;
                    }
                    event.preventDefault();
                    if (typeof self.events[key] === "function")
                        self.events[key].call(self, event, val);
                    else
                        self.trigger(self.events[key], event, val);
                };

                if (selector) {
                    $(self.el)
                        .undelegate(selector, event)
                        .delegate(selector, event, handler);
                } else {
                    $(self.el)
                        .unbind(event)
                        .bind(event, handler);
                }
            }(key));

            return this;
        },

        // Hide elements, disable form inputs, unbind event handlers, etc.
        deactivate: function () {
            $(this.el).hide();
            return this;
        },

        // Gets called when this view is at the end of it's life cycle.
        destroy: function () {
            this.$(this.el).empty().undelegate();
            return this;
        },

        // Return the value of this view. Useful for form inputs and widgets,
        // etc. Do validation here and throw errors as needed.
        valueOf: function () {}
    };
    BaseView.prototype.$ = BaseView.prototype.jQuery = localJQuery;
    mixin(BaseView.prototype, eventEmitter);

    app.defineView = function (name, parent, protoProps, ctorProps) {
        // Handle argument matching manually if name or parent is not passed.
        if (typeof name !== "string") {
            ctorProps = protoProps;
            protoProps = parent;
            parent = name;
        }
        if (typeof parent !== "function") {
            ctorProps = protoProps;
            protoProps = parent;
            parent = app.views.BaseView;
        }

        protoProps = protoProps || {};
        ctorProps  = ctorProps  || {};

        bindSelf(protoProps);

        this.events = protoProps.events || {};
        bindSelf(this.events);

        var view = inherits(parent, protoProps, ctorProps);
        if (name) app.views[name] = view;
        return view;
    };

}());
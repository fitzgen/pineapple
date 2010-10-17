(function () {

    app.models = {};

    var BaseModel = app.models.BaseModel = function (attrs) {
        attrs = attrs || {};
        this.attributes = {};
        var self = this;

        // Create the accessors. Use self-invoking function so that all the
        // accessors don't close over the same `key` variable.
        for (var k in attrs) if (attrs.hasOwnProperty(k)) (function (key) {
            self.attributes[key] = attrs[key];
            self[key] = function (val, opts) {
                if (arguments.length === 0)
                    return this.attributes[key];
                this.attributes[key] = val;
                return this;
            };
        }(k));

        this.initialize && this.initialize(this);
    };
    BaseModel.prototype = {
        constructor: BaseModel,
        initialize: function () {}
    };

    app.defineModel = function (name, parent, protoProps, ctorProps) {
        // Handle argument matching manually if name or parent is not passed.
        if (typeof name !== "string") {
            ctorProps = protoProps;
            protoProps = parent;
            parent = name;
        }
        if (typeof parent !== "function") {
            ctorProps = protoProps;
            protoProps = parent;
            parent = app.models.BaseModel;
        }

        protoProps = protoProps || {};
        ctorProps  = ctorProps  || {};

        bindSelf(protoProps);

        var model = inherits(parent, protoProps, ctorProps);
        if (name) app.models[name] = model;
        return model;
    };

}());
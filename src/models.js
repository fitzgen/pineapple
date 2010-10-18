(function () {

    app.models = {};

    var BaseModel = app.models.BaseModel = function (attrs) {
        attrs = attrs || {};
        this.attributes = {};
        var self = this;

        // Create the accessors for all the attrs on initialization.
        for (var k in attrs) if (attrs.hasOwnProperty(k))
            this.newAccessor(k, attrs[k]);

        this.initialize(attrs);
    };
    BaseModel.prototype = {
        constructor: BaseModel,
        initialize: function () {},
        // Create an automatic get/set accessor for the given attribut name,
        // optionally initializing the attribute to val.
        newAccessor: function (name, val) {
            this.attributes[name] = val;
            this[name] = function (val, opts) {
                if (arguments.length === 0)
                    return this.attributes[name];
                this.attributes[name] = val;
                return this;
            };
            return this;
        }
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
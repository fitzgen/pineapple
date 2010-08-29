// ### Modules

(function () {

    app.modules = {};

    app.defineModule = function (name, constructor) {
        app.modules[name] = constructor;
        return this;
    };

}());
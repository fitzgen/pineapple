the("app.models", function () {

    should("define a new, named model", function () {
        var Entry = app.defineModel("Entry", {});
        equal(app.models.Entry, Entry);
    });

    should("support model inheritence", function () {
        var Automobile = app.defineModel({});
        equal((new Automobile) instanceof app.models.BaseModel, true);

        var Car = app.defineModel(Automobile, {});
        equal((new Car) instanceof Automobile, true);
    });

    should("provide automatic accessors for properties", function () {
        var obj = new app.models.BaseModel({ foo: 4, bar: 10 });
        equal(typeof obj.foo, "function");
        equal(typeof obj.bar, "function");
        ok(obj.foo !== obj.bar, "Different accessors");

        equal(obj.foo(), 4);
        equal(obj.foo(1).foo(), 1);
        equal(obj.bar(), 10);
        equal(obj.bar(15).bar(), 15);
    });

    should("support constructor methods", function () {
        var Ctor = app.defineModel({}, { ctorMethod: function () {} });
        equal(typeof Ctor.ctorMethod, "function");
        equal(typeof (new Ctor).ctorMethod, "undefined");
    });

    should("bind first argument of prototype methods to this", 1, function () {
        var Model = app.defineModel({
            instanceMethod: function (self) {
                equal(self, this);
            }
        });
        (new Model).instanceMethod();
    });

});
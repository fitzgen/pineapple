the("app.views", function () {

    should("define a new, named view", function () {
        var Box = app.defineView("Box", {});
        equal(app.views.Box, Box);
    });

    should("support view inheritence", function () {
        var Box = app.defineView({});
        equal((new Box) instanceof app.views.BaseView, true);

        var Rect = app.defineView(Box, {});
        equal((new Rect) instanceof Box, true);
    });

    should("have an HTMLElement in this.el", function () {
        // String
        var view = new app.views.BaseView({
            el: "div"
        });
        equal(view.el instanceof HTMLElement, true);

        // jQuery
        view = new app.views.BaseView({
            el: $("<div>")
        });
        equal(view.el instanceof HTMLElement, true);

        // HTMLElement
        view = new app.views.BaseView({
            el: document.createElement("div")
        });
        equal(view.el instanceof HTMLElement, true);

        // Default
        view = new app.views.BaseView({});
        equal(view.el instanceof HTMLElement, true);
    });

    should("attach to parent on activation", function () {
        var parent = $("<div>");
        var view = new app.views.BaseView({
            el: "div",
            parent: parent
        });
        equal(parent.children().length, 0);

        view.activate();
        equal(parent.children().length, 1);
    });

    should("bind events directly by name", 1, function () {
        var View = app.defineView({
            events: {
                "click a": "some-event"
            }
        });
        var el = $("<div>").append("<a/>");
        var v = new View({ el: el });
        v.activate();
        var timer = setTimeout(function () {
            ok(false, "Timeout is up");
            start();
        }, 250);
        v.bind("some-event", function () {
            ok(true, "some-event fired");
            clearTimeout(timer);
            start();
        });
        el.find("a").click();
    }, true);

    should("bind events to functions that proxy triggering", 1, function () {
        var View = app.defineView({
            events: {
                "click a": function (self) {
                    self.trigger("some-event");
                }
            }
        });
        var el = $("<div>").append("<a/>");
        var v = new View({ el: el });
        v.activate();
        var timer = setTimeout(function () {
            ok(false, "Timeout is up");
            start();
        }, 250);
        v.bind("some-event", function (self) {
            ok(true, "some-event fired");
            clearTimeout(timer);
            start();
        });
        el.find("a").click();
    }, true);

    should("bind events without selector to this.el", 2, function () {
        var View = app.defineView({
            defaultElement: "a",
            events: {
                "click": function (self) {
                    self.trigger("some-event");
                }
            }
        });
        var v = new View;
        equal(v.activate, app.views.BaseView.prototype.activate);
        v.activate();
        var timer = setTimeout(function () {
            ok(false, "Timeout is up");
            start();
        }, 250);
        v.bind("some-event", function (self) {
            ok(true, "some-event fired");
            clearTimeout(timer);
            start();
        });
        $(v.el).click();
    }, true);

});
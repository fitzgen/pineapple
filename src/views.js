// ### Views

(function () {

    // Implementation

    app.views = {};

    app.defineView = function (name, constructor) {
        app.views[name] = constructor;
        return this;
    };

    // Builtin Views

    function labelify(name) {
        return name.replace(/[-_]/g, " ")
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .replace(/\b([a-z])/, function (m, p1) {
                return p1.toUpperCase();
            })
            + ":";
    }

    var counter = 0;
    function genName (name) {
        return name + counter++;
    }

    // TODO: event handlers
    // required: lib.name
    // Optional: lib.label
    app.defineView("textInput", function (lib, container) {

        var input = $("<input type='text' />"),
        name = genName(lib.name);
        input.attr("name", name);

        var label = $("<label style='display:none'>")
            .attr("for", name)
            .text(lib.label || labelify(lib.name))
            .append(input)
            .appendTo(container);

        return {
            start: function (initialVal) {
                initialVal && input.val(initialVal);
                label.show();
            },
            stop: function () {
                label.hide();
                input.val("");
            },
            valueOf: function () {
                return input.val();
            }
        };
    });

    // TODO: event handlers
    // Required: lib.name
    // Optional: lib.label
    app.defineView("button", function (lib, container) {

        var input = $("<input type='submit' style='display:none' />")
            .attr("name", genName(lib.name))
            .attr("value", lib.label || labelify(lib.name))
            .appendTo(container);

        return {
            start: function () {
                input.show();
            },
            stop: function () {
                input.hide();
            },
            valueOf: function () {
                return input.val();
            }
        };
    });

    // TODO: Refactor this to suport lists, divs, ps, tables, etc... Validation.
    //
    // Example:
    //
    //     var form = app.views.form({
    //         fields: [
    //             [app.views.textInput, { name: "username" }],
    //             [app.views.passwordInput, { name: "password" }],
    //             [app.views.button, {
    //                  name: "login",
    //                  onClick: function () { alert("hey"); }
    //              }]
    //         ],
    //         onSubmit: function () {
    //             ...
    //         }
    //     }, container);
    app.defineView("form", function (lib, container) {
        var ul = $("<ul>"),
        i = 0,
        fields = {},
        form = $("<form style='display:none'>").appendTo(container);

        ul.appendTo(form);

        for ( ; i < lib.fields.length; i++)
            fields[lib.fields[i][1].name] = lib.fields[i][0](lib.fields[i][1],
                                                             $("<li>").appendTo(ul));

        function getData() {
            var data = {};
            for (var k in fields) if (fields.hasOwnProperty(k))
                data[k] = fields[k].valueOf();
            return data;
        }

        return {
            start: function (initial) {
                initial = initial || {};

                form.bind("submit", function (e) {
                    e.preventDefault();
                    lib.onSubmit(getData());
                });

                for (var k in fields) if (fields.hasOwnProperty(k))
                    fields[k].start(initial[k]);

                form.show();
            },
            stop: function () {
                form.hide();
                for (var k in fields) if (fields.hasOwnProperty(k))
                    fields[k].stop();
                form.unbind("submit");
            },
            valueOf: getData
        };
    });

}());
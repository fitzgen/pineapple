(function () {

    // Initialize a new pineapple app.
    var app = window.app = new pineapple();

    // ### Data Layer

    var todos = (function () {
        var store = [];

        // If we have access to localStorage, load the todos from it and begin
        // saving them back every half second.
        if (window.localStorage) {

            if (window.localStorage.pineappleTodos) {
                store = JSON.parse(window.localStorage.pineappleTodos);
                for (var i = 0; i < store.length; i++)
                    app.publish("render new todo", store[i]);
            }

            setInterval(function () {
                window.localStorage.pineappleTodos = JSON.stringify(store);
            }, 500);

        }

        app.subscribe("new todo", function (todo) {
            store.push(todo);
            app.publish("render new todo", todo);
        });

        app.subscribe("change todo", function (i, newTodo) {
            store[i] = newTodo;
        });

        app.subscribe("delete todo", function (todo) {
            store.splice(store.indexOf(todo), 1);
        });

        return {
            at: function (i) {
                return store[i];
            }
        };
    }());

    // ### Custom UI Modules

    // This handles rendering and interaction with the list of TODOs.

    app.defineModule("todoList", function (lib, container) {
        $("<a href='#/new/'>Add a TODO</a>").appendTo(container);
        var ul = $("<ul style='display:none'>").appendTo(container);

        lib.onNewTodo(function (todo) {
            ul.append(renderTodo(todo));
        });

        lib.onChangeTodo(function (i, newTodo) {
            ul.find("li").eq(i).replaceWith(renderTodo(newTodo));
        });

        ul.delegate("input[type=checkbox]", "change", function () {
            lib.deleteTodo($(this).parent().remove().text());
        });

        ul.delegate("a", "click", function (ev) {
            ev.preventDefault();
            lib.edit( ul.find("li").index($(this).closest("li")) );
        });

        function renderTodo (todo) {
            return "<li><input type='checkbox'> <a href='#/edit/'>" + todo + "</a></li>";
        }

        return {
            start: function () {
                container.children().show();
            },
            stop: function () {
                container.children().hide();
            }
        };
    });

    // This is a form widget for editing/creating a single TODO.

    app.defineModule("todoForm", function (lib, container) {
        var form = $("<form style='display:none'>")
            .append("<input type='text'>")
            .append("<input type='submit'>")
            .submit(function (ev) {
                ev.preventDefault();
                var data = $(this).find("input[type=text]").val();
                data = lib.strip(data);
                if (data)
                    lib.save(data);
                else
                    // TODO: better validation error messages ;)
                    alert("Validation error!");
            })
            .appendTo(container);

        return {
            start: function (opts) {
                form.find("input[type=text]").val(opts.initialVal || "");
                form.find("input[type=submit]").val(opts.label || "Submit");
                form.show();
            },
            stop: function () {
                form.hide();
            }
        };
    });

    // ### Routes

    // Routes represent higher level states of the application and communication
    // between different parts of the app.

    // This is the main route, which displays the list of TODOs.

    app.defineRoute("^#/$", (function () {

        var todoList = app.modules.todoList({
            onNewTodo: function (f) {
                app.subscribe("render new todo", f);
            },
            onChangeTodo: function (f) {
                app.subscribe("change todo", f);
            },
            deleteTodo: function (todo) {
                app.publish("delete todo", todo);
            },
            edit: function (i) {
                app.redirect("#/edit/_/".replace("_", i));
            }
        }, $("<div>").appendTo(document.body));

        return {
            enter: function (path) {
                todoList.start();
            },
            exit: function () {
                todoList.stop();
            }
        };

    }()));

    // Route for creating a new TODO.

    app.defineRoute("^#/new/$", (function () {

        var form = app.modules.todoForm({
            strip : strip,
            save  : function (todo) {
                app.publish("new todo", todo);
                app.redirect("#/");
            }
        }, $("<div>").appendTo(document.body));

        return {
            enter: function () {
                form.start({
                    label: "Add New TODO"
                });
            },
            exit: function () {
                form.stop();
            }
        };

    }()));

    // This is a route to edit an existing TODO.

    app.defineRoute("^#/edit/(\\d+)/$", (function () {

        var oldTodo,
        form = app.modules.todoForm({
            strip : strip,
            save  : function (newTodo) {
                app.publish("change todo", oldTodo, newTodo);
                app.redirect("#/");
            }
        }, $("<div>").appendTo(document.body));

        return {
            enter: function (path, index) {
                oldTodo = index;
                form.start({
                    initialVal: todos.at(index),
                    label: "Save TODO"
                });
            },
            exit: function () {
                form.stop();
            }
        };

    }()));

    // Once the app has loaded, go to the main view.

    app.subscribe("ready", function () {
        app.redirect("#/");
    })

    // Utility function.

    function strip (text) {
        return text.replace(/^\s+/, "").replace(/\s+$/, "");
    }

}());

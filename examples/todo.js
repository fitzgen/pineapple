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

        var form = app.modules.form({
            fields: [
                [app.modules.textInput, { name: "todo" }],
                [app.modules.button, {
                    name: "add",
                    label: "Add new TODO"
                }]
            ],
            onSubmit: function (data) {
                app.publish("new todo", data.todo);
                app.redirect("#/");
            }
        }, $("<div>").appendTo(document.body));

        return {
            enter: function () {
                form.start();
            },
            exit: function () {
                form.stop();
            }
        };

    }()));

    // This is a route to edit an existing TODO.

    app.defineRoute("^#/edit/(\\d+)/$", (function () {

        var oldTodo,
        form = app.modules.form({
            fields: [
                [app.modules.textInput, { name: "todo" }],
                [app.modules.button, {
                    name: "add",
                    label: "Update TODO"
                }]
            ],
            onSubmit: function (data) {
                app.publish("change todo", oldTodo, data.todo);
                app.redirect("#/");
            }
        }, $("<div>").appendTo(document.body));

        return {
            enter: function (path, index) {
                oldTodo = index;
                form.start({
                    todo: todos.at(index)
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

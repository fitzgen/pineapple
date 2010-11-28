/*jslint onevar: true, undef: true, eqeqeq: true, bitwise: true,
  newcap: true, immed: true, nomen: false, white: false, plusplus: false,
  laxbreak: true */

/*global window, document */

(function () {

    function makeView (el) {
        return {
            show: function () {
                el.style.display = "block";
            },
            hide: function () {
                el.style.display = "none";
            },
            find: function (tag) {
                return el.getElementsByTagName(tag);
            }
        };
    }

    function makeCollection () {
        var models = [],
            handlers = {};

        return {
            add: function (obj) {
                models.push(obj);
                this.trigger("add", obj);
                return this;
            },
            filter: function (fn) {
                return models.filter(fn);
            },
            remove: function (obj) {
                var idx;
                models.forEach(function (o, i) {
                    if (o === obj) {
                        idx = i;
                    }
                });
                models.splice(idx, 1);
                this.trigger("remove", obj);
                return this;
            },
            trigger: function (ev) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (handlers[ev]) {
                    handlers[ev].forEach(function (h) {
                        return h.apply(window, args);
                    });
                }
                return this;
            },
            on: function (ev, fn) {
                handlers[ev] = handlers[ev] || [];
                handlers[ev].push(fn);
                return this;
            }
        };
    }

    function renderTODO (todo) {
        return [
            "<li id='todo-" + todo.id + "'>",
            "  <form method='POST' action='/completed/'>",
            "    <input type='hidden' name='id' value='" + todo.id + "' />",
            "    <input type='submit' value='X' />",
            todo.task,
            "  </form>",
            "</li>"
        ].join("\n");
    }

    var main      = makeView(document.getElementById("main")),
        add       = makeView(document.getElementById("add")),
        todos     = makeCollection(),
        idCounter = 0;

    todos.on("add", function (todo) {
        main.find("ul")[0].innerHTML += renderTODO(todo);
    });

    todos.on("remove", function (todo) {
        var el = document.getElementById("todo-" + todo.id);
        el.parentElement.removeChild(el);
    });

    window.routes = {

        "GET /": function () {
            add.hide();
            main.show();
        },

        "GET /add/": function () {
            main.hide();
            add.show();
        },

        "POST /add/": function (params) {
            todos.add({
                completed: false,
                task: params.task,
                id: idCounter++
            });
            // TODO: redirect
        },

        "POST /completed/": function (params) {
            document
                .getElementById("todo-" + params.id)
                .style
                .textDecoration = "line-through";
            // TODO: redirect
        },

        "POST /clear/": function () {
            todos.filter(function (todo) { return todo.completed; })
                 .forEach(function (todo) { todos.remove(todo); });
        },

        "GET /favicon.ico": function () {
            // TODO: how to ignore this...
        }

    };

}());
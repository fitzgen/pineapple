(function () {

    // Initialize a new pineapple app.
    var app = window.app = new pineapple();

    // ### Data Layer

    var todoIdCounter = 0;
    var Todo = app.defineModel("Todo", {
        initialize: function (self, opts) {
            function assertHasAttr (attr) {
                attr in self.attributes || (function () {
                    throw new Error("The '" + attr + "' is required for Todo.");
                }());
            }
            assertHasAttr("title");
            assertHasAttr("content");
            assertHasAttr("priority");
            self.newAccessor("id", todoIdCounter++)
        }
    }, {
        compare: function (a, b) {
            return a.priority() === b.priority()
                ? 0
                : a.priority() > b.priority()
                    ? 1
                    : -1;
        }
    });

    // ### Custom UI Views

    var NewTodoForm = app.defineView("NewTodoForm", {
        el: "form",
        initialize: function (self, opts) {
            self.$(self.el)
                .append([
                    "<input type=\"text\" placeholder=\"Title...\" /><br/>",
                    "<textarea placeholder=\"Details...\"></textarea><br/>",
                    "<label>Priority:",
                    "  <select>",
                    "    <option value=\"1\">1</option>",
                    "    <option value=\"2\">2</option>",
                    "    <option value=\"3\">3</option>",
                    "  </select>",
                    "</label>",
                    "<input type=\"submit\" value=\"Create\" />"
                ].join(""));
        },
        events: {
            "submit": "submit"
        },
        valueOf: function (self) {
            return {
                title: self.$("input[type=text]").val(),
                content: self.$("textarea").val(),
                priority: parseInt(self.$("select").val(), 10)
            };
        }
    });

    var TodoView = app.defineView("Todo", {
        el: "li",
        initialize: function (self, opts) {
            self.$(self.el)
                .append([
                    "<input type=\"checkbox\" />",
                    "<a href=\"#\">", opts.title, "</a>",
                    "<form>",
                    "  <textarea style=\"display:none;\">", opts.content, "</textarea>",
                    "  <label>Priority:",
                    "    <select>",
                    "      <option value=\"1\">1</option>",
                    "      <option value=\"2\">2</option>",
                    "      <option value=\"3\">3</option>",
                    "    </select>",
                    "  </label>",
                    "  <input type=\"submit\" value=\"Save\" />",
                    "</form>"
                ].join(""))
                .find("option[value=" + opts.priority + "]")
                .attr("selected", true);
        },
        events: {
            "click input[type=checkbox]": "delete",
            "click a": function (self, event, val) {
                self.$("form").show();
                self.trigger("show-detail", event, val);
            },
            "submit form": function (self, event, val) {
                self.$("form").hide();
                self.trigger("change", event, val);
            }
        },
        valueOf: function (self) {
            return {
                priority: parseInt(self.$("select").val(), 10),
                content: self.$("textarea").val()
            };
        }
    });

    var TodoListView = app.defineView("TodoListView", {
        defaultElement: "ol",
        initialize: function (self, opts) {
            self.todos = [];
            self.views = [];
            this.$(self.el).append("<div><a href=\"#/new/\">New TODO</a></div>");
        },
        activate: function (self) {
            app.views.BaseView.prototype.activate.call(self);
            self.todos.sort(Todo.compare);
            for (var i = 0; i < self.todos.length; i++) {
                self.views.push((new TodoView({ parent: self.el,
                                                title: self.todos[i].title(),
                                                content: self.todos[i].content(),
                                                priority: self.todos[i].content()
                                              }))
                                .activate()
                                .bind("change", function (event, val) {
                                    // TODO: save back to model...
                                    self.refresh();
                                }));
            }
            return this;
        },
        deactivate: function (self) {
            app.views.BaseView.prototype.deactivate.call(this);
            while (self.views.length > 0)
                self.views.pop().deactivate().destroy();
            return this;
        },
        events: {
            "click a.new-todo": "new"
        },
        insert: function (self, todo) {
            self.todos.push(todo);
        },
        refresh: function (self) {
            return self.deactivate().activate();
        }
    });


    // ### Routes

    var todoList = new TodoListView({
        parent: document.body
    });
    todoList.bind("new", function () {
        app.redirect("#/new/");
    });

    app.defineRoute("^#/$", (function () {

        return {
            enter: function (path) {
                todoList.activate();
            },
            exit: function () {
                todoList.deactivate();
            }
        };

    }()));

    app.defineRoute("^#/new/$", (function () {

        var form = new NewTodoForm({
            parent: document.body
        });
        form.bind("submit", function (event, val) {
            todoList.insert(new Todo(val));
            app.redirect("#/");
        });

        return {
            enter: function (path) {
                form.activate();
            },
            exit: function () {
                form.deactivate();
            }
        };

    }()));

    app.defineRoute("^#/edit/(\\d+)/$", (function () {

        return {
            enter: function (path, index) {
            },
            exit: function () {
            }
        };

    }()));

    app.ready(function () {
        app.redirect("#/");
    });

}());

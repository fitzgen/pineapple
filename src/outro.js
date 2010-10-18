// Stuff to fire on document.ready
var onReadys = [];
app.ready = function (fn) {
    onReadys.push(fn);
    return this;
};

$(document).ready(function () {
    while (onReadys.length > 0)
        onReadys.pop()();
});

};
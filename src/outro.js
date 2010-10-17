// Stuff to fire on document.ready
var onReadys = [];
app.ready = function (fn) {
    onReadys.push(fn);
    return this;
};

$(document).ready(function () {
    for ( ; onReadys.length > 0; onReadys.pop()() ) ;
});

// Delete global references to jQuery so people can't cheat their way out of the
// framework (except when testing).
(window.the && window.should) || delete window.$;
(window.the && window.should) || delete window.jQuery;

};
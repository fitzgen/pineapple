$(document).ready(function () {
    app.publish("ready");
});

// Delete global references to jQuery so people can't cheat their way out of the
// framework (except when testing).
(window.the && window.should) || delete window.$;
(window.the && window.should) || delete window.jQuery;

};
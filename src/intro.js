window["pineapple"] = function () {
    if ( !(this instanceof window.pineapple) )
        return new window.pineapple();

    // ### Private methods and variables

    var undefined, app = this;

    function async (f) {
        setTimeout(f, 20);
    }
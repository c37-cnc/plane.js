define("plane/structure/group", ['require', 'exports'], function (require, exports) {

    function Group() {};

    Group.prototype = {
        initialize: function (attrs) {

            return true;
        },
        contains: function (position, transform) {

            return false;
        },
        intersect: function (rectangle) {

            return true;
        },
        toObject: function () {

            return true;
        }
        
    };

    function create(attrs) {
        if (typeof attrs == 'function') {
            throw new Error('Tool - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // 1 - verificações dos atributos 
        // 2 - crio um novo group

        return new Group();
    };

    exports.create = create;

});
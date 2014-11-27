define("plane/structure/object", ['require', 'exports'], function (require, exports) {

    var types = require('plane/utility/types');

    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Shape
     * @class Shape
     * @constructor
     */
    function Shape() {};


    Shape.prototype = {
        initialize: function (attrs) {

            // o nome do shape
            attrs.name = types.string.format('{0} - {1}', [attrs.type, attrs.uuid]);

            debugger;

            types.object.extend(this, attrs);



//            this.calculeSegments();

            return true;
        },
        contains: function () {

            return true;
        },
        intersect: function () {

            return true;
        },
        render: function () {

            return true;
        },
        toObject: function () {

            return true;
        }



    };

    exports.Shape = Shape;

});
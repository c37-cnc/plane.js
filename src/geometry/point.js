(function (Draw) {
    "use strict";

    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Geometry
     * @class Point
     * @constructor
     */
    function Point(x, y) {

        /**
         * A x point
         *
         * @property x
         * @type String
         * @default '0'
         */
        this.x = 0;

        /**
         * A y point
         *
         * @property y
         * @type String
         * @default '0'
         */
        this.y = 0;
    }

    Point.prototype = {
        addition: function () {

        },
        subtract: function () {

        },
        multiply: function () {

        },
        divide: function () {

        }
    }

    Draw.Geometry.Point = Point;

}(Draw));
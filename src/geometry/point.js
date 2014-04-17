(function (draw) {
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
    function point(x, y) {

        if (!(this instanceof point)) {

            var xxx = new point(x, y);

            return xxx;
        }

        /**
         * A x point
         *
         * @property x
         * @type String
         * @default '0'
         */
        this.x = x || 0;

        /**
         * A y point
         *
         * @property y
         * @type String
         * @default '0'
         */
        this.y = y || 0;



    }

    point.prototype = {
        addition: function () {

        },
        subtract: function () {

        },
        multiply: function () {

        },
        divide: function () {

        }
    }

    draw.geometry.point = point;

}(draw));
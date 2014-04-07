/*!
 * C37 in 06-04-2014 at 21:54:40 
 *
 * sparrow-shape version: 1.0.0
 * licensed by Creative Commons Attribution-ShareAlike 3.0
 *
 * Copyright - C37 http://c37.co - 2014
 */
/*global window:true*/

/*
 * Sparrow Shape
 */

(function (window) {
    "use strict";

    /**
     * Static class holding library specific information
     * the library.
     * @class Sparrow Shape
     **/
    var sparrowShape = {};

    /**
     * @property version
     * @type String
     * @static
     **/
    sparrowShape.version = '1.0.0';

    /**
     * @property author
     * @type String
     * @static
     **/
    sparrowShape.author = 'lilo@c37.co';

    window.sparrowShape = shape;
}(window));
(function (sparrowShape) {
    "use strict";

    function Shape(x, y) {

        // public properties
        this.x = x || 0;
        this.y = y || 0;

        // private properties
        arguments = arguments;

        // public methods
        this.move = function (x, y) {
            return true;
        }

        this.delete = function () {
            return true;
        }

        this.toString = function () { 
            return "[" + this.constructor.name + " x : " + this.x + ", y : " + this.y + ", position : " + getPosition() + "]";
        }

        // private methods
        function getPosition() {
            return [this.x + 100, this.y + 100];
        }


    }

    sparrowShape.Geometry.Shape = Shape;

}(sparrowShape));
(function (sparrowShape) {
    "use strict";

    function Polygon(x, y, sides) {
        sparrowShape.geometry.Element.call(this, x, y);

        this.sides = sides || 3;

    }

    sparrowShape.Polygon = Polygon;

}(sparrowShape));
/*!
 * C37 in 08-04-2014 at 21:43:05 
 *
 * sparrow-shape version: 1.0.0
 * licensed by Creative Commons Attribution-ShareAlike 3.0
 *
 * Copyright - C37 http://c37.co - 2014
 */
(function (Sparrow) {
    "use strict";

    function Object(x, y) {

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

    Sparrow.Shape.Geometry.Object = Object;

}(Sparrow));

 

(function (Sparrow) {
    "use strict";

    function Polygon(x, y, sides) {
        sparrowShape.geometry.Element.call(this, x, y);

        this.sides = sides || 3;

    }

    Sparrow.Shape.Object.Polygon = Polygon;

}(Sparrow));
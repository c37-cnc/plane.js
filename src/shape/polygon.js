(function (Draw) {
    "use strict";

    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Shape
     * @class Polygon
     * @extends Geometry.Shape
     * @constructor
     */
    function Polygon(x, y, sides) {

        Draw.Geometry.Shape.call(this, x, y);

        this.sides = sides || 3;

    }

    Draw.Shape.Polygon = Polygon;

}(Draw));
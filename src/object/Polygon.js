(function (Sparrow) {
    "use strict";

    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Shape.Object
     * @class Polygon
     * @extends Shape.Geometry.Object
     * @constructor
     */
    function Polygon(x, y, sides) {

        Sparrow.Shape.Geometry.Object.call(this, x, y);

        this.sides = sides || 3;

    }

    Sparrow.Shape.Object.Polygon = Polygon;

}(Sparrow));
(function (Sparrow) {
    "use strict";

    function Polygon(x, y, sides) {
        sparrowShape.geometry.Element.call(this, x, y);

        this.sides = sides || 3;

    }

    Sparrow.Shape.Object.Polygon = Polygon;

}(Sparrow));
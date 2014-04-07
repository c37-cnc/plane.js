(function (sparrowShape) {
    "use strict";

    function Polygon(x, y, sides) {
        sparrowShape.geometry.Element.call(this, x, y);

        this.sides = sides || 3;

    }

    sparrowShape.Polygon = Polygon;

}(sparrowShape));
define("shapes/polygon", ['require', 'exports'], function (require, exports) {

    var Shape = require('geometric/shape').Shape;

    var Polygon = (function (base) {

        function Polygon(attrs) {

            this.type = 'polygon';
            this.points = attrs.points;
            this.sides = attrs.sides;

            base.call(this, attrs.uuid, attrs.name, attrs.locked, attrs.visible, attrs.selected);
        }
        Polygon.prototype = Shape.prototype;

        return Polygon;
        
    })(Shape);

    exports.Polygon = Polygon;
});
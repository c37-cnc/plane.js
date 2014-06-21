define("shapes/ellipse", ['require', 'exports'], function (require, exports) {

    var Shape = require('geometric/shape').Shape;

    var Ellipse = (function (base) {

        function Ellipse(attrs) {

            this.type = 'ellipse';
            this.point = attrs.point;
            this.radiusY = attrs.radiusY;
            this.radiusX = attrs.radiusX;

            base.call(this, attrs.uuid, attrs.name, attrs.locked, attrs.visible, attrs.selected);

        }
        Ellipse.prototype = Shape.prototype;

        return Ellipse;
        
    })(Shape);

    exports.Ellipse = Ellipse;
});
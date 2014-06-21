define("shapes/arc", ['require', 'exports'], function (require, exports) {

    var Shape = require('geometric/shape').Shape;

    var Arc = (function (base) {

        function Arc(attrs) {

            this.type = 'arc';
            this.point = attrs.point;
            this.radius = attrs.radius;
            this.startAngle = attrs.startAngle;
            this.endAngle = attrs.endAngle;
            this.clockWise = attrs.clockWise;

            base.call(this, attrs.uuid, attrs.name, attrs.locked, attrs.visible, attrs.selected);

        };
        Arc.prototype = Shape.prototype;

        return Arc;
        
    })(Shape);

    exports.Arc = Arc;
});
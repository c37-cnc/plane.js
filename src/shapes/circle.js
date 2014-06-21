define("shapes/circle", ['require', 'exports'], function (require, exports) {

    var Shape = require('geometric/shape').Shape;

    var Circle = (function (base) {

        function Circle(attrs) {

            this.type = 'circle';
            this.point = attrs.point;
            this.radius = attrs.radius;

            base.call(this, attrs.uuid, attrs.name, attrs.locked, attrs.visible, attrs.selected);

        }
        Circle.prototype = Shape.prototype;

        return Circle;

    })(Shape);

    exports.Circle = Circle;
});
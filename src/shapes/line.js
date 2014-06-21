define("shapes/line", ['require', 'exports'], function (require, exports) {

    var Shape = require('geometric/shape').Shape;

    var Line = (function (base) {

        function Line(attrs) {

            this.type = 'line';
            this.points = attrs.points;
            this.style = attrs.style;

            base.call(this, attrs.uuid, attrs.name, attrs.locked, attrs.visible, attrs.selected);
        }
        Line.prototype = Shape.prototype;

        return Line;
        
    })(Shape);

    exports.Line = Line;
});
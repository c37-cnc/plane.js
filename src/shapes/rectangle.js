define("shapes/rectangle", ['require', 'exports'], function (require, exports) {

    var Shape = require('geometric/shape').Shape;

    var Rectangle = (function (base) {

        function Rectangle(attrs) {

            this.type = 'rectangle';
            this.point = attrs.point;
            this.height = attrs.height;
            this.width = attrs.width;

            base.call(this, attrs.uuid, attrs.name, attrs.locked, attrs.visible, attrs.selected);
        }
        Rectangle.prototype = Shape.prototype;

        return Rectangle;
        
    })(Shape);

    exports.Rectangle = Rectangle;
});
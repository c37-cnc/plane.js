define("plane/structure/point", ['require', 'exports'], function (require, exports) {

    function Point(x, y) {
        this.x = x;
        this.y = y;
    };

    Point.prototype = {
        sum: function (point) {
            return new Point(this.x + point.x, this.y + point.y);
        },
        subtract: function (point) {
            return new Point(this.x - point.x, this.y - point.y);
        },
        negate: function () {
            return new Point(-this.x, -this.y);
        },
        multiply: function (value) {
            return new Point(this.x * value, this.y * value);
        },
        distanceTo: function (point) {
            var dx = this.x - point.x;
            var dy = this.y - point.y;

            return Math.sqrt(dx * dx + dy * dy);
        },
        midTo: function (point) {
            return new Point(this.x + (point.x - this.x) / 2, this.y + (point.y - this.y) / 2);
        },
        angleTo: function (point) {
            return Math.atan2(point.y - this.y, point.x - this.x);
        },
        interpolationLinear: function (point, value) {
            return new Point(
                this.x + (point.x - this.x) * value,
                this.y + (point.y - this.y) * value
            );
        }
    };

    function create() {

        if (arguments.length == 2 && (arguments[0] != null && arguments[1] != null)) {
            return new Point(arguments[0], arguments[1]);
        } else if (arguments.length == 1 && typeof arguments == 'object' && (arguments[0].x != null && arguments[0].y != null)) {
            return new Point(arguments[0].x, arguments[0].y);
        }

        throw new Error('Point - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');

    };

    exports.create = create;

});
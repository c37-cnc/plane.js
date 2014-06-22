define("geometric/point", ['require', 'exports'], function (require, exports) {

    function Point(x, y) {
        this.x = x;
        this.y = y;
    };

    Point.prototype = {
        Operations: {
            Sum: function (point) {
                return new Point(this.x + point.x, this.y + point.y);
            },
            Subtract: function (point) {
                return new Point(this.x - point.x, this.y - point.y);
            }
        },
        Measures: {
            DistanceTo: function (point) {
                var dx = this.x - point.x;
                var dy = this.y - point.y;

                return Math.sqrt(dx * dx + dy * dy);
            },
            MidTo: function (point) {
                return new Point(this.x + (point.x - this.x) / 2, this.y + (point.y - this.y) / 2);
            },
            AngleTo: function (point) {
                return Math.atan2(point.y - this.y, point.x - this.x);
            }
        },
        Functions: {
            InterpolationLinear: function (point, value) {
                return new Point(
                    this.x + (point.x - this.x) * value,
                    this.y + (point.y - this.y) * value
                );
            }
        }
    };

    function Create(x, y) {
        return new Point(x, y);
    };

    exports.Create = Create;

});
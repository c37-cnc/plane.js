define("geometric/point", ['require', 'exports'], function (require, exports) {

    function Point(X, Y) {
        this.X = X;
        this.Y = Y;
    };

    Point.prototype = {
        sum: function (point) {
            return new Point(this.X + point.X, this.Y + point.Y);
        },
        subtract: function (point) {
            return new Point(this.X - point.X, this.Y - point.Y);
        },
        multiply: function (value) {
            return new Point(this.X * value, this.Y * value);
        },
        distanceTo: function (point) {
            var dx = this.X - point.X;
            var dY = this.Y - point.Y;

            return Math.sqrt(dx * dx + dY * dY);
        },
        midTo: function (point) {
            return new Point(this.X + (point.X - this.X) / 2, this.Y + (point.Y - this.Y) / 2);
        },
        angleTo: function (point) {
            return Math.atan2(point.Y - this.Y, point.X - this.X);
        },
        interpolationLinear: function (point, value) {
            return new Point(
                this.X + (point.X - this.X) * value,
                this.Y + (point.Y - this.Y) * value
            );
        }
    };

    function create(X, Y) {
        return new Point(X, Y);
    };

    exports.create = create;

});
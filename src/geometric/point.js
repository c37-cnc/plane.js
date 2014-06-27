define("geometric/point", ['require', 'exports'], function (require, exports) {

    function Point(X, Y) {
        this.X = X;
        this.Y = Y;
    };

    Point.prototype = {
        Sum: function (point) {
            return new Point(this.X + point.X, this.Y + point.Y);
        },
        Subtract: function (point) {
            return new Point(this.X - point.X, this.Y - point.Y);
        },
        MultiplY: function (value) {
            return new Point(this.X * value, this.Y * value);
        },
        DistanceTo: function (point) {
            var dx = this.X - point.X;
            var dY = this.Y - point.Y;

            return Math.sqrt(dx * dx + dY * dY);
        },
        MidTo: function (point) {
            return new Point(this.X + (point.X - this.X) / 2, this.Y + (point.Y - this.Y) / 2);
        },
        AngleTo: function (point) {
            return Math.atan2(point.Y - this.Y, point.X - this.X);
        },
        InterpolationLinear: function (point, value) {
            return new Point(
                this.X + (point.X - this.X) * value,
                this.Y + (point.Y - this.Y) * value
            );
        }
    };

    function Create(X, Y) {
        return new Point(X, Y);
    };

    exports.Create = Create;

});
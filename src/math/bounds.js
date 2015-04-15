(function (plane) {
    "use strict";

    function Bounds(from, to) {

        this.from = from;
        this.to = to;
        this.center = null;
        this.radius = 0;
        this.width = 0;
        this.height = 0;

        this._calcule();

    }

    /**
     * Calculates the MBR when rotated some number of radians about an origin point o.
     * Necessary on a rotation, or a resize
     */
    // https://github.com/craftyjs/Crafty/blob/2f131c55c60e1aecc68923c9576c6dad00539d82/src/spatial/2d.js#L358
    

    Bounds.prototype = {
        _calcule: function () {

            // https://github.com/craftyjs/Crafty/blob/bcd581948c61966ed589c457feb32358a0afd9c8/src/spatial/collision.js#L154
            var center = {
                x: (this.from.x + this.to.x) / 2,
                y: (this.from.y + this.to.y) / 2
            },
            radius = Math.sqrt((this.to.x - this.from.x) * (this.to.x - this.from.x) + (this.to.y - this.from.y) * (this.to.y - this.from.y)) / 2;

            this.center = plane.point.create(center);
            this.radius = radius;

            this.width = this.to.x - this.from.x;
            this.height = this.to.y - this.from.y;

            return true;

        }
    };

    plane.math.bounds = {
        create: function (from, to) {
            return new Bounds(from, to);
        }
    };

})(plane);
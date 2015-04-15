(function (plane) {
    "use strict";

    function Bounds(from, to) {
        this.from = from;
        this.to = to;
    }

    /**
     * Calculates the MBR when rotated some number of radians about an origin point o.
     * Necessary on a rotation, or a resize
     */
    // https://github.com/craftyjs/Crafty/blob/2f131c55c60e1aecc68923c9576c6dad00539d82/src/spatial/2d.js#L358


    Bounds.prototype = {
        get center() {
            // https://github.com/craftyjs/Crafty/blob/bcd581948c61966ed589c457feb32358a0afd9c8/src/spatial/collision.js#L154
            var center = {
                x: (this.from.x + this.to.x) / 2,
                y: (this.from.y + this.to.y) / 2
            };

            return plane.point.create(center);
        },
        get radius() {
            if (this.center) {
                return Math.sqrt((this.to.x - this.from.x) * (this.to.x - this.from.x) + (this.to.y - this.from.y) * (this.to.y - this.from.y)) / 2;
            }
        },
        get width() {
            return this.to.x - this.from.x;
        },
        get height() {
            return this.to.y - this.from.y;
        }
    };

    plane.math.bounds = {
        create: function (from, to) {
            return new Bounds(from, to);
        }
    };

})(plane);
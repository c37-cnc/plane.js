(function (plane) {
    "use strict";

    function Bounds(from, to) {
        this.from = from;
        this.to = to;
    }

    Bounds.create = function (from, to) {
        return new Bounds(from, to);
    };

    /**
     * Calculates the MBR when rotated some number of radians about an origin point o.
     * Necessary on a rotation, or a resize
     */
    // https://github.com/craftyjs/Crafty/blob/2f131c55c60e1aecc68923c9576c6dad00539d82/src/spatial/2d.js#L358


    Bounds.prototype = {
        constructor: Bounds,
        get center() {
            // https://github.com/craftyjs/Crafty/blob/bcd581948c61966ed589c457feb32358a0afd9c8/src/spatial/collision.js#L154
            var center = {
                x: (this.from.x + this.to.x) / 2,
                y: (this.from.y + this.to.y) / 2
            };

            return plane.point.create(center);
        },
        get radius() {

//            var from = plane.point.create(this.from),
//                to = plane.point.create(this.to);
//            
//            return from.distanceTo(to) / 2;
            return Math.sqrt(((this.to.x - this.from.x) * (this.to.x - this.from.x)) + ((this.to.y - this.from.y) * (this.to.y - this.from.y))) / 2;
        },
        get width() {
            return this.to.x - this.from.x;
        },
        get height() {
            return this.to.y - this.from.y;
        },
        toMarkedPoints: function () {

            var points = [];

            var from = this.from,
                to = this.to;

            var leftBotton = plane.point.create(from),
                leftTop = plane.point.create(from.x, to.y),
                leftMiddle = leftBotton.midTo(leftTop);

            var rightTop = plane.point.create(to),
                rightBottom = plane.point.create(to.x, from.y),
                rightMiddle = rightBottom.midTo(rightTop);

            var topMiddle = leftTop.midTo(rightTop),
                bottomMidle = rightBottom.midTo(leftBotton);

            points.push(leftBotton);
            points.push(leftMiddle);
            points.push(leftTop);

            points.push(topMiddle);

            points.push(rightTop);
            points.push(rightMiddle);
            points.push(rightBottom);

            points.push(bottomMidle);

            points.push(this.center);

            points.push(bottomMidle);
            points.push(leftBotton);
            
            return points;

        },
        toPolygonPoints: function () {

            var points = [];

            var from = this.from,
                to = this.to;

            var leftBotton = plane.point.create(from),
                leftTop = plane.point.create(from.x, to.y),
                leftMiddle = leftBotton.midTo(leftTop);

            var rightTop = plane.point.create(to),
                rightBottom = plane.point.create(to.x, from.y),
                rightMiddle = rightBottom.midTo(rightTop);

            var topMiddle = leftTop.midTo(rightTop),
                bottomMidle = rightBottom.midTo(leftBotton);

            points.push(leftBotton);
            points.push(leftMiddle);
            points.push(leftTop);

            points.push(topMiddle);

            points.push(rightTop);
            points.push(rightMiddle);
            points.push(rightBottom);

            points.push(bottomMidle);

            points.push(bottomMidle);
            points.push(leftBotton);
            
            return points;

        }
    };

    plane.math.bounds = Bounds;

})(c37.library.plane);
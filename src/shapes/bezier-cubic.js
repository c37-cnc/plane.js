define("plane/shapes/bezier-cubic", ['require', 'exports'], function (require, exports) {

    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Shapes
     * @extends Shape
     * @class Bezier Cubic
     * @constructor
     */
    // https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Canvas_tutorial/Drawing_shapes#Bezier_and_quadratic_curves
    function BezierCubic(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.transform = attrs.transform;
        this.status = attrs.status;

        this.type = 'bezier-cubic';
        this.points = attrs.points;
    };


    BezierCubic.prototype = {
        toObject: function () {
            return {
                uuid: this.uuid,
                type: this.type,
                name: this.name,
                status: this.status,
                points: this.points.map(function (point) {
                    return {
                        a: [types.math.parseFloat(point.a.x, 5), types.math.parseFloat(point.a.y, 5)],
                        b: [types.math.parseFloat(point.b.x, 5), types.math.parseFloat(point.b.y, 5)],
                        c: [types.math.parseFloat(point.c.x, 5), types.math.parseFloat(point.c.y, 5)]
                    }
                })
            };
        },
        render: function (context, transform) {

            context.beginPath();

            var scale = Math.sqrt(transform.a * transform.d);
            var move = {
                x: transform.tx,
                y: transform.ty
            };

            // https://github.com/MartinDoms/Splines/blob/master/cubicBezier.js

            var pts = [],
                lineSegments = 100;


            var dot = function (v1, v2) {
                var sum = 0;
                for (var i = 0; i < v1.length; i++) {
                    sum += v1[i] * v2[i];
                }
                return sum;
            };

            var cubicBezier = function (points, t) {
                var p0 = points[0];
                var p1 = points[1];
                var p2 = points[2];
                var p3 = points[3];
                var t3 = t * t * t;
                var t2 = t * t;

                var dx = dot([p0.x, p1.x, p2.x, p3.x], [(1 - t) * (1 - t) * (1 - t), 3 * (1 - t) * (1 - t) * t, 3 * (1 - t) * t2, t3]);
                var dy = dot([p0.y, p1.y, p2.y, p3.y], [(1 - t) * (1 - t) * (1 - t), 3 * (1 - t) * (1 - t) * t, 3 * (1 - t) * t2, t3]);

                return {
                    x: dx,
                    y: dy
                };
            }


            for (var j = 0; j < lineSegments + 1; j++) {
                pts.push(cubicBezier(this.points, j / lineSegments));
            }


            for (var i = 0; i < pts.length; i += 2) {
                context.lineTo(pts[i].x * scale + move.x, pts[i].y * scale + move.y);
            }
            context.stroke();




        }
    }




    function create(attrs) {
        if (typeof attrs == 'function') {
            throw new Error('Tool - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // 1 - verificações dos atributos 
        // 2 - crio um novo group

        return new BezierCubic(attrs);
    };

    exports.create = create;

});
define("plane/shapes/bezier-quadratic", ['require', 'exports'], function (require, exports) {

    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Structure
     * @extends Shape
     * @class Bezier Quadratic
     * @constructor
     */
    // https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Canvas_tutorial/Drawing_shapes#Bezier_and_quadratic_curves
    function BezierQuadratic(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.transform = attrs.transform;
        this.status = attrs.status;

        this.type = 'bezier-quadratic';
        this.points = attrs.points;
    };

    BezierQuadratic.prototype = {
        render: function (context, transform) {

            context.beginPath();

            var scale = Math.sqrt(transform.a * transform.d);
            var move = {
                x: transform.tx,
                y: transform.ty
            };


            var pts = [],
                lineSegments = 100;


            var dot = function (v1, v2) {
                var sum = 0;
                for (var i = 0; i < v1.length; i++) {
                    sum += v1[i] * v2[i];
                }
                return sum;
            }

            var quadraticBezier = function (points, t) {
                var p0 = points[0];
                var p1 = points[1];
                var p2 = points[2];
                var t3 = t * t * t;
                var t2 = t * t;

                var dx = dot([p0.x, p1.x, p2.x], [(1 - t) * (1 - t), 2 * t * (1 - t), t2]);
                var dy = dot([p0.y, p1.y, p2.y], [(1 - t) * (1 - t), 2 * t * (1 - t), t2]);

                return {
                    x: dx,
                    y: dy
                };
            }

            for (var j = 0; j < lineSegments + 1; j++) {
                pts.push(quadraticBezier(this.points, j / lineSegments));
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

        return new BezierQuadratic(attrs);
    };

    exports.create = create;

});
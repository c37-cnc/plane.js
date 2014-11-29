define("plane/shapes/spline", ['require', 'exports'], function (require, exports) {

    var intersection = require('plane/geometric/intersection'),
        matrix = require('plane/geometric/matrix');

    var point = require('plane/structure/point'),
        object = require('plane/structure/object');

    var types = require('plane/utility/types');


    /**
     * Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
     * nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
     * volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
     * ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
     *
     * @namespace Shape
     * @class Shape
     * @constructor
     */
    var Spline = types.object.inherits(function Spline(attrs) {

        /**
         * A Universally unique identifier for
         * a single instance of Object
         *
         * @property uuid
         * @type String
         * @default 'uuid'
         */
        this.uuid = null;
        this.type = null;
        this.name = null;

        this.segments = [];
        this.status = null;
        this.style = null;

        this.degree = attrs.degree;
        this.knots = attrs.knots;
        this.points = attrs.points;

        this.initialize(attrs);

    }, object.Shape);

    Spline.prototype.calculeSegments = function () {

        /*
                    Finds knot vector span.

                    p : degree
                    u : parametric value
                    U : knot vector

                    returns the span
                */
        var findSpan = function (p, u, U) {
            var n = U.length - p - 1;

            if (u >= U[n]) {
                return n - 1;
            }

            if (u <= U[p]) {
                return p;
            }

            var low = p;
            var high = n;
            var mid = Math.floor((low + high) / 2);

            while (u < U[mid] || u >= U[mid + 1]) {

                if (u < U[mid]) {
                    high = mid;
                } else {
                    low = mid;
                }

                mid = Math.floor((low + high) / 2);
            }

            return mid;
        }

        /*
                    Calculate basis functions. See The NURBS Book, page 70, algorithm A2.2

                    span : span in which u lies
                    u    : parametric point
                    p    : degree
                    U    : knot vector

                    returns array[p+1] with basis functions values.
                */
        var calcBasisFunctions = function (span, u, p, U) {
            var N = [];
            var left = [];
            var right = [];
            N[0] = 1.0;

            for (var j = 1; j <= p; ++j) {

                left[j] = u - U[span + 1 - j];
                right[j] = U[span + j] - u;

                var saved = 0.0;

                for (var r = 0; r < j; ++r) {

                    var rv = right[r + 1];
                    var lv = left[j - r];
                    var temp = N[r] / (rv + lv);
                    N[r] = saved + rv * temp;
                    saved = lv * temp;
                }

                N[j] = saved;
            }

            return N;
        }

        /*
                    Calculate B-Spline curve points. See The NURBS Book, page 82, algorithm A3.1.

                    p : degree of B-Spline
                    U : knot vector
                    P : control points (x, y, z, w)
                    u : parametric point

                    returns point for given u
                */
        var calcBSplinePoint = function (p, U, P, u) {
            var span = findSpan(p, u, U);
            var N = calcBasisFunctions(span, u, p, U);
            //                    var C = new THREE.Vector4(0, 0, 0, 0);
            var C = {
                x: 0,
                y: 0
            };

            for (var j = 0; j <= p; ++j) {
                var point = P[span - p + j];
                var Nj = N[j];
                //                        var wNj = point.w * Nj;
                C.x += point.x * Nj;
                C.y += point.y * Nj;
                //                        C.z += point.z * wNj;
                //                        C.w += point.w * Nj;
            }

            return C;
        }


        var getPoint = function (t, degree, knots, points) {

            var u = knots[0] + t * (knots[knots.length - 1] - knots[0]); // linear mapping t->u

            // following results in (wx, wy, wz, w) homogeneous point
            var hpoint = calcBSplinePoint(degree, knots, points, u);

            //                    if (hpoint.w != 1.0) { // project to 3D space: (wx, wy, wz, w) -> (x, y, z, 1)
            //                        hpoint.divideScalar(hpoint.w);
            //                    }

            //                    return new THREE.Vector3(hpoint.x, hpoint.y, hpoint.z);
            return {
                x: hpoint.x,
                y: hpoint.y
            };
        }

        var getPoints = function (divisions, degree, knots, points) {

            var d, pts = [];

            for (d = 0; d <= divisions; d++) {

                pts.push(getPoint(d / divisions, degree, knots, points));

            }
            return pts;
        }

        var LEUWF3cpo = function (_param1, degree, knots, points) {

            var point3Farray = [];

            for (var index1 = 0; index1 < knots.length - 1; ++index1) {
                var num1 = knots[index1];
                var num2 = knots[index1 + 1];

                if (num2 > num1) {
                    for (var index2 = 0; index2 <= (_param1 == 0 ? 12 : _param1); ++index2) {
                        var p = calcBSplinePoint(degree, knots, points, num1 + (num2 - num1) * index2 / (_param1 == 0 ? 12.0 : _param1));
                        point3Farray.push(p);
                    }
                }
            }
            return point3Farray;
        }

        this.segments = LEUWF3cpo(17, this.degree, this.knots, this.points);


        return true;

    }


    function create(attrs) { 
        // 0 - verificação da chamada
        if (typeof attrs == 'function') {
            throw new Error('Spline - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // 1 - verificações de quais atributos são usados


        // 2 - validações dos atributos deste tipo


        // 3 - conversões dos atributos
        attrs.points = attrs.points.map(function(item){
            return point.create(item);
        });

        // 4 - criando um novo shape do tipo arco
        return new Spline(attrs);
    };

    exports.create = create;

});
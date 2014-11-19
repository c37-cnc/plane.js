define("plane/shapes/spline-nurbs", ['require', 'exports'], function (require, exports) {

    var intersection = require('plane/geometric/intersection'),
        matrix = require('plane/geometric/matrix');

    var point = require('plane/structure/point');


    function SplineNurbs(attrs) {
        this.uuid = attrs.uuid;
        this.name = attrs.name;
        this.transform = attrs.transform;
        this.status = attrs.status;

        this.segments = [];

        this.type = 'spline-nurbs';
        this.degree = attrs.degree;
        this.knots = attrs.knots;
        this.points = attrs.points;

        this.initialize();

    };


    SplineNurbs.prototype = {
        initialize: function () {
        
        
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

            //                debugger;

            //                                var xxx = getPoints(800, this.degree, this.knots, this.points);
            this.segments = LEUWF3cpo(17, this.degree, this.knots, this.points);
       
        
        
        },
        render: function (context, transform) {
            
            // possivel personalização
            if (this.style) {
                context.save();

                context.lineWidth = this.style.lineWidth ? this.style.lineWidth : context.lineWidth;
                context.strokeStyle = this.style.lineColor ? this.style.lineColor : context.lineColor;
            }
            

            context.beginPath();

            var scale = Math.sqrt(transform.a * transform.d);
            var move = {
                x: transform.tx,
                y: transform.ty
            };


            
            context.moveTo(this.segments[0].x * scale + move.x, this.segments[0].y * scale + move.y);
            
            for (var i = 0; i < this.segments.length; i += 2) {
                var x = this.segments[i].x * scale + move.x;
                var y = this.segments[i].y * scale + move.y;

                context.lineTo(x, y);
            }
            
            
            context.closePath();
            
            context.stroke();
            
            // possivel personalização
            if (this.style) {
                context.restore();
            }
            

        },
        contains: function (position, transform) {

            var scale = Math.sqrt(transform.a * transform.d);
            var move = point.create(transform.tx, transform.ty);


            var segmentA = null,
                segmentB = null;

            for (var i = 0; i < this.segments.length; i++) {

                if (i + 1 == this.segments.length) {
                    segmentA = this.segments[i];
                    segmentB = this.segments[0];
                } else {
                    segmentA = this.segments[i];
                    segmentB = this.segments[i + 1];
                }

                if (intersection.circleLine(position, 4, point.create(segmentA.x * scale + move.x, segmentA.y * scale + move.y), point.create(segmentB.x * scale + move.x, segmentB.y * scale + move.y)))
                    return true;
            }

            return false;

        }



    }





    function create(attrs) {
        if (typeof attrs == 'function') {
            throw new Error('Tool - create - attrs is not valid \n http://requirejs.org/docs/errors.html#' + 'errorCode');
        }

        // 1 - verificações dos atributos 
        // 2 - crio um novo group

        return new SplineNurbs(attrs);
    };

    exports.create = create;

});